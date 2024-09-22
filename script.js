document.addEventListener('DOMContentLoaded', () => {
    const desktop = document.getElementById('desktop');
    const windowsContainer = document.getElementById('windows');
    const icons = document.querySelectorAll('.icon');
    const startButton = document.querySelector('.start-button');
    const startMenu = document.querySelector('.start-menu');
    const startMenuItems = document.querySelectorAll('.start-menu-item');
    const contextMenu = document.getElementById('context-menu');

    startButton.addEventListener('click', toggleStartMenu);
    
    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            const windowType = icon.getAttribute('data-window');
            createWindow(windowType);
        });
    });

    startMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const windowType = item.getAttribute('data-window');
            createWindow(windowType);
            toggleStartMenu();
        });
    });

    document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
            startMenu.style.display = 'none';
        }
        contextMenu.style.display = 'none';
    });

    desktop.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
    });

    function toggleStartMenu() {
        if (startMenu.style.display === 'none' || startMenu.style.display === '') {
            startMenu.style.display = 'block';
            startMenu.style.opacity = '0';
            setTimeout(() => {
                startMenu.style.opacity = '1';
            }, 10);
        } else {
            startMenu.style.opacity = '0';
            setTimeout(() => {
                startMenu.style.display = 'none';
            }, 300);
        }
    }

    function createWindow(type) {
        const window = document.createElement('div');
        window.className = 'window';
        window.style.top = '50px';
        window.style.left = '50px';
        window.style.opacity = '0';
        window.style.transform = 'scale(0.9)';

        const header = document.createElement('div');
        header.className = 'window-header';
        header.innerHTML = `
            <span><i class="fas fa-${getIconForType(type)}"></i> ${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span class="close-button">×</span>
        `;

        const content = document.createElement('div');
        content.className = 'window-content';
        content.innerHTML = getContentForType(type);

        window.appendChild(header);
        window.appendChild(content);
        windowsContainer.appendChild(window);

        makeDraggable(window);

        const closeButton = window.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            window.style.opacity = '0';
            window.style.transform = 'scale(0.9)';
            setTimeout(() => {
                windowsContainer.removeChild(window);
            }, 300);
        });

        setTimeout(() => {
            window.style.opacity = '1';
            window.style.transform = 'scale(1)';
        }, 10);
    }

    function getIconForType(type) {
        switch(type) {
            case 'about': return 'user';
            case 'projects': return 'project-diagram';
            case 'contact': return 'envelope';
            case 'skills': return 'cogs';
            case 'notepad': return 'sticky-note';
            default: return 'window-maximize';
        }
    }

    function getContentForType(type) {
        switch(type) {
            case 'about':
                return `
<h2 style="font-size: 2.5em; font-weight: bold; color: #333; text-align: center; margin-bottom: 20px;">About Me</h2>
<p style="font-size: 1.2em; line-height: 1.6; color: #666; text-align: justify; margin-bottom: 15px;">
    Hi there! I'm <span style="font-weight: bold; color: #000;">Pixlo</span>, an 18-year-old graphic designer from Sri Lanka with a passion for creativity. I've been designing since 2018, starting during the COVID era, and I'm still exploring new ways to improve my skills every day. Even though I'm still in high school, I've worked on a variety of projects and offer a range of graphic design services to help bring your ideas to life.
</p>
<p style="font-size: 1.2em; line-height: 1.6; color: #666; text-align: justify; margin-bottom: 15px;">
    I also dabble in <span style="font-weight: bold; color: #000;">3D modeling</span> and <span style="font-weight: bold; color: #000;">animation</span>, and I'm a big fan of <span style="font-weight: bold; color: #000;">AI</span>. I love using the latest AI tools to speed up my workflow and make designs even better – it's like having a secret weapon that helps me create top-quality work, faster.
</p>
<p style="font-size: 1.2em; line-height: 1.6; color: #666; text-align: justify; margin-bottom: 15px;">
    Whether you need branding, digital illustrations, or anything else graphic design-related, I'm here to help make your vision a reality. Let's create something amazing together!
</p>
`;
            case 'projects':
                return `<h2>My Projects</h2><ul><li>Project 1</li><li>Project 2</li><li>Project 3</li></ul>`;
            case 'contact':
                return `<h2>Contact Me</h2><p>Email: kavindushehan0819@gmail.com</p><p>Phone: +94 78 663 7511</p><p>WhatsApp: +94 78 663 7511</p><p>Facebook: PIXLO Graphics</p>`;
            case 'skills':
                return `<h2>My Skills</h2><ul><li>HTML/CSS</li><li>JavaScript</li><li>React</li><li>Node.js</li></ul>`;
            case 'notepad':
                return `
                    <div style="display: flex; flex-direction: column; height: 100%;">
                        <div style="padding: 10px; background-color: #f0f0f0; border-bottom: 1px solid #ccc;">
                            <button onclick="document.execCommand('bold', false, null)">Bold</button>
                            <button onclick="document.execCommand('italic', false, null)">Italic</button>
                            <button onclick="document.execCommand('underline', false, null)">Underline</button>
                            <select onchange="document.execCommand('fontSize', false, this.value)">
                                <option value="1">Small</option>
                                <option value="3" selected>Normal</option>
                                <option value="5">Large</option>
                                <option value="7">Extra Large</option>
                            </select>
                        </div>
                        <div contenteditable="true" style="flex-grow: 1; padding: 10px; overflow-y: auto; background-color: white;">
                            Start typing here...
                        </div>
                    </div>
                `;
            default:
                return `This is the ${type} window content.`;
        }
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.querySelector('.window-header').onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Update clock
    function updateClock() {
        const clockElement = document.querySelector('.clock');
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        clockElement.textContent = timeString;
    }

    setInterval(updateClock, 1000);
    updateClock();
});
