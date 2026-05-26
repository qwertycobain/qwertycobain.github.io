const timeZone = 'America/Sao_Paulo';
const skills = ['Linux', 'Redes', 'Troubleshooting', 'Git/GitHub', 'Node.js', 'APIs RESTful', 'Python', 'DevOps'];
const projects = [
    {
        name: 'API RESTful em Node.js',
        status: 'concluido',
        description: 'Projeto para praticar rotas, requisicoes HTTP e organizacao backend.',
    },
    {
        name: 'Laboratorio Linux',
        status: 'em construcao',
        description: 'Espaco para scripts, comandos, redes, diagnostico e automacao.',
    },
    {
        name: 'Projetos DevOps',
        status: 'proximo passo',
        description: 'Area reservada para deploy, CI/CD, monitoramento e infraestrutura.',
    },
];

const sequence = [
    {
        command: 'whoami',
        lines: ['Francisco Oliveira', 'Estudante de ADS | futuro DevOps'],
    },
    {
        command: 'cat foco.txt',
        lines: [
            'Linux, redes, automacao e solucao de problemas.',
            'Buscando estagio para aprender em ambiente real.',
        ],
    },
    {
        command: 'skills --list',
        lines: [
            'Linux | Redes | Troubleshooting | Git/GitHub',
            'Node.js | APIs RESTful | Python | DevOps',
        ],
    },
    {
        command: 'ls projetos/',
        lines: [
            'api-rest-nodejs        concluido',
            'laboratorio-linux      em construcao',
            'devops-labs            proximo passo',
        ],
    },
    {
        command: 'cat contato.md',
        lines: [
            'LinkedIn: linkedin.com/in/francisco-oliveira-733916246',
            'GitHub: github.com/qwertycobain',
        ],
    },
];

const output = document.querySelector('#terminal-output');

function getSaoPauloDate() {
    return new Date(new Date().toLocaleString('en-US', { timeZone }));
}

function renderIntroDate() {
    const now = getSaoPauloDate();
    const hour = now.getHours();
    const greeting = hour >= 6 && hour < 12
        ? 'Bom dia'
        : hour >= 12 && hour < 18
            ? 'Boa tarde'
            : 'Boa noite';

    document.querySelector('#greeting').textContent = greeting;
    document.querySelector('#current-year').textContent = now.getFullYear();
    document.querySelector('#current-date').textContent = now.toLocaleString('pt-BR', {
        timeZone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function renderSkills() {
    const fragment = document.createDocumentFragment();

    skills.forEach((skill) => {
        const item = document.createElement('span');
        item.textContent = skill;
        fragment.appendChild(item);
    });

    document.querySelector('#skills-list').appendChild(fragment);
}

function renderProjects() {
    const fragment = document.createDocumentFragment();

    projects.forEach(({ name, status, description }) => {
        const card = document.createElement('article');
        card.className = 'card';

        const statusLabel = document.createElement('small');
        const title = document.createElement('h3');
        const text = document.createElement('p');

        statusLabel.textContent = status;
        title.textContent = name;
        text.textContent = description;

        card.append(statusLabel, title, text);
        fragment.appendChild(card);
    });

    document.querySelector('#projects-list').appendChild(fragment);
}

function printLine(text, className = '') {
    const line = document.createElement('div');
    line.className = className ? `line ${className}` : 'line';
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function printPrompt(command) {
    const line = document.createElement('div');
    line.className = 'line';

    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = 'francisco@devops:~$';

    line.append(prompt, ` ${command}`);
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typePrompt(command) {
    const line = document.createElement('div');
    const prompt = document.createElement('span');

    line.className = 'line cursor';
    prompt.className = 'prompt';
    prompt.textContent = 'francisco@devops:~$';
    line.append(prompt, ' ');
    output.appendChild(line);

    for (let index = 0; index < command.length; index += 1) {
        line.lastChild.textContent = ` ${command.slice(0, index + 1)}`;
        await sleep(38);
    }

    line.classList.remove('cursor');
    output.scrollTop = output.scrollHeight;
}

async function runTerminal() {
    await sleep(700);

    for (const item of sequence) {
        await typePrompt(item.command);
        await sleep(260);
        item.lines.forEach((line) => printLine(line));
        await sleep(900);
    }

    printPrompt('status');
    printLine('disponivel para estagio', 'muted');
}

renderIntroDate();
renderSkills();
renderProjects();
runTerminal();
