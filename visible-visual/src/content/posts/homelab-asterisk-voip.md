---
title: "Estudei 2 dias pra uma entrevista que não aconteceu"
description: "Uma vaga de estágio em telecom pedindo 3CX, SNEP, Wireshark e SIP me motivou a subir um servidor Asterisk do zero. A entrevista não aconteceu, mas o aprendizado ficou."
pubDatetime: 2026-08-24T11:00:00-03:00
tags:
  - asterisk
  - voip
  - sip
  - homelab
  - linux
  - wireshark
  - telecom
featured: false
draft: false
---

Recebi uma chamada para entrevista de estágio em uma empresa de telecomunicações. A vaga era de estágio e pedia experiência com **3CX**, **SNEP**, **Wireshark** e protocolo **SIP**. Dos citados, eu só conhecia o Wireshark, e tinha 2 dias pra estudar. Fui pra cima com tudo pra tentar entender a fundo como isso tudo funcionava.

Li bastante, dediquei meus 2 dias somente a isso pra ir preparado pra entrevista.

No momento que eu estava arrumado e pronto pra sair, recebi uma mensagem dizendo que tiveram imprevistos e teriam que remarcar, posteriormente disseram que cancelaram a vaga 🤡.

Mas é aquilo, se a vida te der limões faça uma caipirinha.

---

## O que é SNEP?

O SNEP é uma solução brasileira de PABX IP bastante usada em empresas por aqui. O que poucos sabem — e eu descobri pesquisando — é que ele é construído em cima do **Asterisk**, que é o motor open source de telefonia mais usado no mundo.

Ou seja: entender o Asterisk é entender a base do SNEP.

---

## A topologia do lab

Ao invés de só ler documentação, subi um ambiente funcional na minha própria rede:

```
┌─────────────────────────────────────────────────────┐
│                  Rede Local (LAN)                   │
│                                                     │
│  ┌──────────────────────────────────┐               │
│  │   VM Ubuntu (VirtualBox - Bridge)                │
│  │   Asterisk PBX                                   │
│  │   Ramal 190 e 991 registrados                    │
│  └──────────┬───────────────────────┘               │
│             │ SIP                                   │
│     ┌───────┴────────┐                              │
│     │                │                              │
│  ┌──┴───┐        ┌───┴───┐                          │
│  │ Host │        │Celular│                          │
│  │Linphone        Linphone                          │
│  │Ramal 991       Ramal 190                         │
│  └──────┘        └─────────┘                        │
└─────────────────────────────────────────────────────┘
```

- **VM Ubuntu** rodando no VirtualBox com adaptador em modo **bridge** — isso faz a VM pegar um IP direto na rede local, sem NAT no meio
- **Asterisk** instalado na VM atuando como PBX (Private Branch Exchange)
- **Linphone** no host (ramal 991) e no celular (ramal 190), ambos na mesma rede

O modo bridge foi essencial: sem ele não daria certo.

---

## Instalação do Asterisk

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install asterisk -y
```

Confirma que o serviço subiu:

```bash
sudo systemctl status asterisk
sudo asterisk -rvvv
```

---

## Configuração dos ramais

O Asterisk usa arquivos de configuração em `/etc/asterisk/`. Os dois principais que editei foram o `pjsip.conf` e o `extensions.conf`.

### /etc/asterisk/pjsip.conf

```ini
[190]
type=endpoint
context=interno
auth=190
aors=190

[190]
type=auth
auth_type=userpass
username=190
password=senha190

[190]
type=aor
max_contacts=1


[991]
type=endpoint
context=interno
auth=991
aors=991

[991]
type=auth
auth_type=userpass
username=991
password=senha991

[991]
type=aor
max_contacts=1
```

### /etc/asterisk/extensions.conf

```ini
[interno]
exten => 190,1,Dial(PJSIP/190)
exten => 991,1,Dial(PJSIP/991)
```

Depois de editar, recarrega as configurações sem derrubar o serviço:

```bash
sudo asterisk -rvvv
# dentro do console do asterisk:
pjsip reload
dialplan reload
```

---

## Registrando os ramais no Linphone

No Linphone (host e celular), configurei uma conta SIP com:

- **Domínio/Servidor SIP**: IP da VM na rede local
- **Usuário**: `190` ou `991`
- **Senha**: a definida no `pjsip.conf`
- **Porta**: 5060 (padrão SIP)
- **Transporte**: UDP

Com o modo bridge ativo, o Linphone do celular enxerga a VM diretamente, sem precisar de port forwarding ou gambiarras ilimunati.

Configuração no celular (ramal 190):

![Configurando conta SIP no Linphone no celular](./configurando%20no%20celular.jpg)

Fiz o mesmo no host (ramal 991), mudando apenas as credenciais — login e senha correspondentes ao ramal 991.

Com os dois ramais registrados, a chamada funcionou:

![Celular ligando para o host via Asterisk](./temos-telefonia.jpg)

---

## Analisando o tráfego com Wireshark

Com tudo funcionando, abri o Wireshark no host para capturar o tráfego SIP entre os dispositivos.

```bash
sudo wireshark
```

Filtro usado:

```
sip
```

![Captura do Wireshark mostrando o tráfego SIP durante a chamada — host 192.168.1.105, Asterisk 192.168.1.107, celular 192.168.1.100](./wireshark.png)

### Fluxo de registro (REGISTER)

Quando o Linphone conecta, o Wireshark mostra o handshake de registro:

```
REGISTER sip:192.168.1.107 SIP/2.0
  → 401 Unauthorized (o servidor pede autenticação)
REGISTER sip:192.168.1.107 SIP/2.0 (com credenciais)
  → 200 OK
```

### Fluxo de chamada (INVITE)

Ao fazer uma chamada do ramal 190 (celular) para o ramal 991 (host):

```
INVITE sip:991@192.168.1.107;transport=udp SIP/2.0  (celular → Asterisk)
  → 100 Trying
  → 180 Ringing
  → 200 OK (INVITE)
ACK sip:asterisk@192.168.1.107:5060 SIP/2.0
  [sessão de áudio RTP estabelecida]
BYE sip:991@192.168.1.105;transport=udp SIP/2.0
  → 200 OK (BYE)
```

### O que tem no SDP

Dentro do pacote `INVITE` vem um bloco **SDP (Session Description Protocol)** que negocia o áudio:

```
v=0
o=- ... IN IP4 192.168.1.100
s=Talk
c=IN IP4 192.168.1.100
t=0 0
m=audio 7078 RTP/AVP 0 8 96
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
```

O `m=audio 7078` indica a porta UDP onde o áudio RTP vai trafegar. O codec `PCMU/8000` (G.711 µ-law) é o padrão para chamadas VoIP, com 8000 amostras por segundo.

---

## O que aprendi com isso

**SIP é só sinalização.** Quem carrega o áudio de verdade é o RTP, em uma porta UDP negociada pelo SDP dentro do INVITE. É uma separação importante pra entender quando você está depurando problemas de chamada.

**Asterisk é poderoso e documentado.** Dá pra fazer muita coisa só editando arquivos de texto. O SNEP provavelmente abstrai tudo isso numa interface gráfica, mas o motor por baixo é o mesmo.

**Wireshark é indispensável em telecom.** Consegui ver cada etapa da negociação SIP, identificar qual codec foi escolhido e confirmar que o registro estava funcionando — tudo sem precisar de log do Asterisk.

---

Infelizmente a entrevista não rolou. Mas pelo menos rendeu meu primeiro post aqui nesse blog e agora eu sei configurar um PBX do zero, entendo como o SIP funciona na prática e consigo ler um trace de Wireshark em VoIP.

Foi divertido.
