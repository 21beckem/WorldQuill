import Cursor from "../assets/Cursor.js";

export default class PanelManager {
    constructor(containerSelector='body') {
        this.initDOM(containerSelector);

        this.tools = [];
    }
    addTool(tool) {
        this.tools.push(tool);
        this.renderTopNav();

        // if this is the first tool, set it as active by default
        if (this.tools.length == 1)
            this.setMode(tool.mode);
    }
    renderTopNav() {
        this.TopNavEl.innerHTML = '';
        this.tools.forEach(tool => {
            const toolBtn = this.generateToolBtn(tool);
            this.TopNavEl.appendChild(toolBtn);
        });
    }
    generateToolBtn(tool) {
        // create button
        const toolBtn = document.createElement('tool-btn');
        toolBtn.className = WorldQuill.ThreeJsWorld._raycaster.mode === tool.mode ? 'active' : '';
        toolBtn.dataset.toolMode = tool.mode;
        toolBtn.innerHTML = `<i class="${tool.icon}"></i>&nbsp;&nbsp;${tool.label}`;

        // add click event
        toolBtn.addEventListener('click', () => {
            tool.activate();
            this.TopNavEl.querySelectorAll('tool-btn').forEach(btn => btn.classList.remove('active'));
            toolBtn.classList.add('active');
        });
        return toolBtn;
    }
    setMode(mode) {
        this.beforeActivate(this.tools.find(tool => tool.mode === mode));
        WorldQuill.ThreeJsWorld._raycaster.setMode(mode);
        this.TopNavEl.querySelectorAll('tool-btn').forEach(btn => {
            if (btn.dataset.toolMode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }


    beforeActivate(tool) {
        this.SidebarTitleEl.innerText = tool.name;
        this.SidebarDetailsEl.innerHTML = '';
        this.SidebarHelpEl.innerHTML = HTMLifyer.generateSidebarHelp(tool);
        Cursor.set(Cursor.default);
    }
    setDetails(details) {
        this.SidebarDetailsEl.innerHTML = '';
        HTMLifyer.generateSidebarDetails(details, this.SidebarDetailsEl);
    }

    




    initDOM(containerSelector) {
        let container = document.querySelector(containerSelector);
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.boxSizing = 'border-box';

        this.containerId = 'PanelContainer_' + Date.now();
        this.initCss(container);
        this.initPanels(container);
    }
    initCss(container) {
        // Add Font Awesome css
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css';
        container.appendChild(fontAwesomeLink);

        // Add font css
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&amp;display=swap';
        container.appendChild(fontLink);

        // Add custom css
        const style = document.createElement('style');
        style.innerHTML = `
:root {
    --${this.containerId}-ui-background-color: #ede7d3;
    --${this.containerId}-ui-box-shadow: 0 2px 5px #ada27daf;
}
#${this.containerId} {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    pointer-events: none;
    font-family: 'Poppins', sans-serif;
}
#${this.containerId} i.fa-solid {
    pointer-events: none;
}
#${this.containerId} > * {
    position: relative;
    padding: 50px 0;
    height: calc(100% - 100px);
}
#${this.containerId} .left-center-section {
    flex: 1;
}
#${this.containerId} .right-section {
    top: 0;
    right: 0;
    width: 320px;
    padding-right: 75px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}



#${this.containerId} .ui-panel {
    background-color: var(--${this.containerId}-ui-background-color);
    box-shadow: var(--${this.containerId}-ui-box-shadow);
    border-radius: 5px;
    pointer-events: auto;
    cursor: default;
}

#${this.containerId} #TopNav {
    margin: 0 auto;
    width: 80%;
    height: 40px;
    display: flex;
    justify-content: space-around;
}
#${this.containerId} tool-btn {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
    font-size: 1rem;
    transition: background-color 0.2s;
    border-right: 1px solid #ccc;
}
#${this.containerId} tool-btn:last-child { border-right: none; }
#${this.containerId} tool-btn:hover, tool-btn.active {
    background-color: #d4cfa8;
}
#${this.containerId} .right-section > div {
    margin: 0 auto;
    width: 100%;
    padding: 5px 20px;
}

#${this.containerId} #SidebarDetails {
    display: flex;
    flex-direction: column;
}
#${this.containerId} #SidebarDetails > * {
    margin: 10px 0;
}
#${this.containerId} #SidebarDetails label {
    display: flex;
    justify-content: space-between;
    width: 100%;
}
#${this.containerId} #SidebarDetails .jscolor {
    cursor: pointer;
}
#${this.containerId} #SidebarDetails label input, #${this.containerId} #SidebarDetails label select {
    max-width: 50%;
    flex: 1;
    padding: 0.5em;
    border-radius: 5px;
}
#${this.containerId} #SidebarDetails button,
#${this.containerId} #SidebarDetails input[type="button"],
#${this.containerId} #SidebarDetails select,
#${this.containerId} #SidebarDetails select option {
    margin: 0;
    display: block;
    padding: 0.5em;
    border-radius: 5px;
    border: none;
    background-color: #d4cfa8;
    cursor: pointer;
}
#${this.containerId} #SidebarDetails > button,
#${this.containerId} #SidebarDetails > input[type="button"],
#${this.containerId} #SidebarDetails > select,
#${this.containerId} #SidebarDetails > select option {
    margin: 0 auto;
    width: 100%;
}
#${this.containerId} #SidebarDetails button:hover,
#${this.containerId} #SidebarDetails input[type="button"]:hover,
#${this.containerId} #SidebarDetails select:hover,
#${this.containerId} #SidebarDetails select option:hover {
    background-color: #c7c29cff;
}
#${this.containerId} #SidebarDetails button.active,
#${this.containerId} #SidebarDetails input[type="button"].active,
#${this.containerId} #SidebarDetails select.active,
#${this.containerId} #SidebarDetails select option:checked {
    background-color: #ebe298;
}
        `;
        container.appendChild(style);
    }
    initPanels(container) {
        this.PanelContainer = document.createElement('div');
        this.PanelContainer.id = this.containerId;
        this.PanelContainer.innerHTML = `
            <div class="left-center-section">
                <div id="TopNav" class="ui-panel">
                </div>
            </div>
            <div class="right-section">
                <div class="ui-panel">
                    <h2 id="SidebarTitle" style="padding-left: 20px;"></h2>
                    <div id="SidebarDetails"></div>
                </div>
                <div id="SidebarHelp" class="ui-panel"></div>
            </div>
        `;
        this.TopNavEl = this.PanelContainer.querySelector('#TopNav');
        this.SidebarTitleEl = this.PanelContainer.querySelector('#SidebarTitle');
        this.SidebarDetailsEl = this.PanelContainer.querySelector('#SidebarDetails');
        this.SidebarHelpEl = this.PanelContainer.querySelector('#SidebarHelp');
        container.appendChild(this.PanelContainer);
    }
}


class HTMLifyer {
    static generateSidebarHelp(tool) {
        return `<p>${tool.description}</p>`;
    }
    static generateSidebarDetails(detailsArr, parentElement) {
        // for each in the array, check the type
        // if type is a string, add HTML to the parent element
        // if type is an object, call the parseObject function

        detailsArr.forEach(item => {
            if (typeof item === 'string') {
                parentElement.appendChild( this.makeTextNode(item) );
            } else if (typeof item === 'object') {
                parentElement.appendChild( this.parseObject(item) );
            }
        });
    }
    static makeTextNode(text) {
        let n = document.createTextNode('span');
        n.innerHTML = text;
        return n;
    }
    static parseObject(obj) {
        // if a label is given, that means it's an input that needs a label
        let el;
        if (obj.label) {
            el = document.createElement( (['select','button'].includes(obj.type)) ? obj.type : 'input' );
            el.setAttribute('type', obj.type);
            el.setAttribute('placeholder', obj.label);
        } else {
            el = document.createElement(obj.type);
        }

        // set attributes and gather events
        let eventAttrs = [];
        (obj.attrs || []).forEach(attr => {
            // if the attribute is an event attribute
            if (attr[0].startsWith('on') && attr[1] !== 'true' && attr[1] !== 'false' && attr[1] !== true && attr[1] !== false)
                eventAttrs.push(attr);
            else
                el.setAttribute(attr[0], attr[1]);
        });

        // set event listeners
        eventAttrs.forEach(attr => {
            el.addEventListener(attr[0].toLowerCase().substring(2), attr[1]);
        });

        // set content
        el.innerHTML = obj.content || '';

        // set style
        if (obj.style)
            el.style.cssText = obj.style;

        // set class
        if (obj.class)
            el.classList.add( ...obj.class.map(c => c.trim()).filter(c => c !== '') );

        // if there are options, make them as children
        if (obj.options) {
            obj.options.map(o => {
                let thisO = {
                    type: 'option',
                    attrs: [['value', o[1]], ],
                    content: o[0]
                };
                if (o[2]===true)
                    thisO.attrs.push(['selected','selected']);
                return thisO;
            }).forEach(c => {
                el.appendChild( this.parseObject(c) );
            });
        }

        // if it has a label, return it with the input
        if (obj.label) {
            let label = document.createElement('label');
            label.innerText = obj.label;
            label.innerHTML += '&nbsp;&nbsp;';
            label.appendChild(el);
            el = label;
        }

        // add child elements
        if (obj.children) {
            obj.children.forEach(c => {
                el.appendChild( this.parseObject(c) );
            });
        }

        return el;
    }
}