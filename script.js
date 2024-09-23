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

    // Add resizable functionality to windows
    function makeResizable(element) {
        interact(element)
            .resizable({
                edges: { bottom: true, right: true },
                listeners: {
                    move(event) {
                        let { x, y } = event.target.dataset

                        x = (parseFloat(x) || 0) + event.deltaRect.left
                        y = (parseFloat(y) || 0) + event.deltaRect.top

                        Object.assign(event.target.style, {
                            width: `${event.rect.width}px`,
                            height: `${event.rect.height}px`,
                            transform: `translate(${x}px, ${y}px)`
                        })

                        Object.assign(event.target.dataset, { x, y })

                        // Resize image if it's a project-image window
                        if (element.getAttribute('data-window') === 'project-image') {
                            const img = element.querySelector('img');
                            if (img) {
                                resizeImage(img, event.rect.width, event.rect.height);
                            }
                        }
                    }
                }
            })
    }

    function createWindow(type) {
        const window = document.createElement('div');
        window.className = 'window';
        window.setAttribute('data-window', type);
        window.style.opacity = '0';
        window.style.transform = 'scale(0.9)';

        // Set specific size for message window
        if (type === 'message') {
            window.style.width = '700px';
            window.style.height = '700px';
            // Position message window to the right of the contact window
            const contactWindow = document.querySelector('.window[data-window="contact"]');
            if (contactWindow) {
                const contactRect = contactWindow.getBoundingClientRect();
                window.style.top = `${contactRect.top}px`;
                window.style.left = `${contactRect.right + 20}px`;
            } else {
                window.style.top = '50px';
                window.style.left = '50px'; // Adjusted to match the 'else' case
            }
        } else {
            window.style.top = '50px';
            window.style.left = '50px';
        }

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
        if (type !== 'message') {
            makeResizable(window);
        }

        const taskbarItem = createTaskbarItem(type, window);

        const closeButton = window.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            window.style.opacity = '0';
            window.style.transform = 'scale(0.9)';
            setTimeout(() => {
                windowsContainer.removeChild(window);
                taskbarItem.remove(); // Remove taskbar item when window is closed
            }, 300);
        });

        const minimizeButton = document.createElement('span');
        minimizeButton.className = 'minimize-button';
        minimizeButton.innerHTML = '−';
        header.insertBefore(minimizeButton, closeButton);

        minimizeButton.addEventListener('click', () => {
            minimizeWindow(window, taskbarItem);
        });

        setTimeout(() => {
            window.style.opacity = '1';
            window.style.transform = 'scale(1)';
        }, 10);

        // Add event listener for the "Send a message" button
        if (type === 'contact') {
            const sendMessageButton = window.querySelector('button');
            sendMessageButton.addEventListener('click', () => createWindow('message'));
        }

        // Add event listener for the message form submission
        if (type === 'message') {
            const form = window.querySelector('form');
            form.addEventListener('submit', handleMessageSubmit);
        }

        // Add event listeners for project images
        if (type === 'projects') {
            const projectImages = window.querySelectorAll('.project-image');
            projectImages.forEach(image => {
                image.addEventListener('click', () => {
                    const projectTitle = image.nextElementSibling.textContent;
                    openImageInNewWindow(projectTitle, image.src);
                });
            });
        }
    }

    function openImageInNewWindow(title, imageSrc) {
        const window = document.createElement('div');
        window.className = 'window';
        window.setAttribute('data-window', 'project-image');
        window.style.width = '800px';
        window.style.height = '600px';
        window.style.top = '50px';
        window.style.left = '50px';

        const header = document.createElement('div');
        header.className = 'window-header';
        header.innerHTML = `
            <span><i class="fas fa-image"></i> ${title}</span>
            <span class="close-button">×</span>
        `;

        const content = document.createElement('div');
        content.className = 'window-content';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';
        content.style.height = 'calc(100% - 40px)';
        content.innerHTML = `
            <img src="${imageSrc}" alt="${title}" style="max-width: 100%; max-height: calc(100% - 40px); object-fit: contain;">
            <h3 style="text-align: center; margin-top: 20px;">${title}</h3>
        `;

        window.appendChild(header);
        window.appendChild(content);
        windowsContainer.appendChild(window);

        makeDraggable(window);
        makeResizable(window);

        const taskbarItem = createTaskbarItem('project-image', window);

        const closeButton = window.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            window.style.opacity = '0';
            window.style.transform = 'scale(0.9)';
            setTimeout(() => {
                windowsContainer.removeChild(window);
                taskbarItem.remove();
            }, 300);
        });

        setTimeout(() => {
            window.style.opacity = '1';
            window.style.transform = 'scale(1)';
            const img = content.querySelector('img');
            resizeImage(img, 800, 560); // Initial resize
        }, 10);
    }

    function resizeImage(img, windowWidth, windowHeight) {
        const maxWidth = windowWidth - 40; // Subtract padding
        const maxHeight = windowHeight - 80; // Subtract header and title height
        
        img.style.maxWidth = `${maxWidth}px`;
        img.style.maxHeight = `${maxHeight}px`;
        img.style.width = 'auto';
        img.style.height = 'auto';
        
        // Adjust image size to fit the window while maintaining aspect ratio
        if (img.width > maxWidth || img.height > maxHeight) {
            const aspectRatio = img.width / img.height;
            if (maxWidth / aspectRatio <= maxHeight) {
                img.style.width = `${maxWidth}px`;
                img.style.height = 'auto';
            } else {
                img.style.width = 'auto';
                img.style.height = `${maxHeight}px`;
            }
        }
    }

    async function handleMessageSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const message = form.querySelector('textarea').value;

        try {
            console.log('Attempting to send message...');
            const response = await fetch('http://localhost:3000/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    to: 'pixlo3d@gmail.com',
                    from: 'MS_Dm6G6a@trial-z86org8wn3kgew13.mlsender.net',
                    smtpUser: 'MS_Dm6G6a@trial-z86org8wn3kgew13.mlsender.net',
                    smtpPass: 'QSmLhspcYlcOvssa',
                    smtpHost: 'smtp.mailersend.net',
                    smtpPort: 587
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Server response:', data);

            if (data.success) {
                alert('Message sent successfully!');
                form.reset();
            } else {
                alert(`Failed to send message: ${data.message}. Please try again later.`);
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert(`Failed to send message: ${error.message}. Please try again later.`);
        }
    }

    function makeDraggable(windowElement) {
        const header = windowElement.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', startDragging);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);

        function startDragging(e) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = windowElement.offsetLeft;
            initialY = windowElement.offsetTop;
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            windowElement.style.left = `${initialX + dx}px`;
            windowElement.style.top = `${initialY + dy}px`;
        }

        function stopDragging() {
            isDragging = false;
        }
    }

    // Move context menu logic here
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        var contextMenu = document.getElementById('context-menu');
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

    function getIconForType(type) {
        switch(type) {
            case 'about': return 'user';
            case 'projects': return 'project-diagram';
            case 'contact': return 'envelope';
            case 'skills': return 'cogs';
            case 'notepad': return 'sticky-note';
            case 'message': return 'comment';
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
                return `
                    <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">My Projects</h2>
                    <div class="project-container" style="overflow-y: auto; max-height: calc(100% - 60px);">
                        ${Array.from({length: 44}, (_, i) => i + 1).map(num => `
                        <div class="project-item">
                            <img src="projects/project${num}.jpg" alt="Project ${num}" class="project-image">
                            <div class="project-title">Project ${num}</div>
                        </div>
                        `).join('')}
                    </div>
                `;
            case 'contact':
                return `
                    <h2>Contact Me</h2>
                    <p>Email: kavindushehan0819@gmail.com</p>
                    <p>Phone: +94 78 663 7511</p>
                    <p>WhatsApp: <a href="https://api.whatsapp.com/send/?phone=94786637511" target="_blank" style="color: #25D366; text-decoration: none; font-weight: bold;">+94 78 663 7511</a></p>
                    <p>Facebook: <a href="https://web.facebook.com/profile.php?id=61563638325298" target="_blank" style="color: #1877F2; text-decoration: none; font-weight: bold;">PIXLO Graphics</a></p>
                    <button onclick="createWindow('message')" style="background-color: #0096FF; color: white; border: none; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 5px;">Send a message</button>
                `;
            case 'skills':
                return `
                    <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">My Graphic Design Skills</h2>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${[
                            "Social Media Graphics", "Book Covers", "Logos & Branding", "Web & App Design",
                            "Posters & Flyers", "Album & Podcast Covers", "Brochures & Magazines", "Packaging Design",
                            "Infographics", "Merchandise Design", "Billboards", "Business Cards",
                            "Menus", "Stationery", "Postcards", "Event Invitations",
                            "Certificates", "Presentation Decks", "Photo Manipulation", "Newsletter Design",
                            "Magazine Ads", "Calendar Design", "Resume/CV Design", "Signage",
                            "Icons", "Letterheads", "Stickers", "Social Media Ads",
                            "Email Templates", "Trade Show Booth Design"
                        ].map(skill => `
                            <div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 14px;">
                                ${skill}
                            </div>
                        `).join('')}
                    </div>
                    <p style="margin-top: 20px; font-style: italic; color: #666;">
                        Basically, literally anything when it comes to graphic design!
                    </p>
                `;
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
                            I'm Pixlo.
                        </div>
                    </div>
                `;
            case 'message':
                return `
                    <h2 style="margin-bottom: 20px;">Send a Message</h2>
                    <form style="display: flex; flex-direction: column; gap: 15px; padding-right: 20px;">
                        <input type="text" placeholder="Your Name" required style="width: calc(100% - 20px); padding: 10px;">
                        <input type="email" placeholder="Your Email" required style="width: calc(100% - 20px); padding: 10px;">
                        <textarea placeholder="Your Message" rows="4" required style="width: calc(100% - 20px); padding: 10px; resize: vertical;"></textarea>
                        <button type="submit" style="align-self: flex-start; padding: 10px 20px;">Send</button>
                    </form>
                `;
            default:
                return `This is the ${type} window content.`;
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

    function createTaskbarItem(windowType, windowElement) {
        const taskbarItem = document.createElement('div');
        taskbarItem.className = 'taskbar-item';
        taskbarItem.setAttribute('data-window', windowType);
        taskbarItem.innerHTML = `<i></i>`;
        taskbarItem.title = windowType.charAt(0).toUpperCase() + windowType.slice(1);
        
        taskbarItem.addEventListener('click', () => {
            if (windowElement.style.display === 'none') {
                restoreWindow(windowElement, taskbarItem);
            } else {
                minimizeWindow(windowElement, taskbarItem);
            }
        });

        const activeWindows = document.querySelector('.active-windows');
        activeWindows.appendChild(taskbarItem);

        return taskbarItem;
    }

    function minimizeWindow(windowElement, taskbarItem) {
        const taskbarRect = taskbarItem.getBoundingClientRect();
        const windowRect = windowElement.getBoundingClientRect();

        const scaleX = taskbarRect.width / windowRect.width;
        const scaleY = taskbarRect.height / windowRect.height;

        const translateX = taskbarRect.left - windowRect.left + (taskbarRect.width - windowRect.width * scaleX) / 2;
        const translateY = taskbarRect.top - windowRect.top + (taskbarRect.height - windowRect.height * scaleY) / 2;

        windowElement.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
        windowElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
        windowElement.style.opacity = '0';

        setTimeout(() => {
            windowElement.style.display = 'none';
            windowElement.style.transform = '';
            windowElement.style.opacity = '';
            windowElement.style.transition = '';
        }, 300);
    }

    function restoreWindow(windowElement, taskbarItem) {
        windowElement.style.display = 'block';
        windowElement.style.opacity = '0';
        
        const taskbarRect = taskbarItem.getBoundingClientRect();
        const windowRect = windowElement.getBoundingClientRect();

        const scaleX = taskbarRect.width / windowRect.width;
        const scaleY = taskbarRect.height / windowRect.height;

        const translateX = taskbarRect.left - windowRect.left + (taskbarRect.width - windowRect.width * scaleX) / 2;
        const translateY = taskbarRect.top - windowRect.top + (taskbarRect.height - windowRect.height * scaleY) / 2;

        windowElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

        requestAnimationFrame(() => {
            windowElement.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
            windowElement.style.transform = '';
            windowElement.style.opacity = '1';
        });

        setTimeout(() => {
            windowElement.style.transition = '';
        }, 300);
    }
});
