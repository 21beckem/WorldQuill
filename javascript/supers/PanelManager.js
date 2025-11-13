export default class PanelManager {
    constructor(containerSelector='body') {
        this.containerId = 'PanelContainer_' + Date.now();
        this.initCss(containerSelector);
        this.initPanels(containerSelector);
    }
    initCss(containerSelector) {
        // Add Font Awesome css
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css';
        document.querySelector(containerSelector).appendChild(fontAwesomeLink);

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
    width: 400px;
    padding-right: 75px;
}



#${this.containerId} .ui-panel {
    background-color: var(--${this.containerId}-ui-background-color);
    box-shadow: var(--${this.containerId}-ui-box-shadow);
    border-radius: 5px;
    pointer-events: auto;
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
    font-family: Arial, sans-serif;
    font-size: 14px;
    transition: background-color 0.2s;
    border-right: 1px solid #ccc;
}
#${this.containerId} tool-btn:last-child { border-right: none; }
#${this.containerId} tool-btn:hover, tool-btn.active {
    background-color: #d4cfa8;
}
#${this.containerId} #Sidebar {
    margin: 0 auto;
    width: 100%;
    height: 100%;
}
        `;
        document.querySelector(containerSelector).appendChild(style);
    }
    initPanels(containerSelector) {
        this.PanelContainer = document.createElement('div');
        this.PanelContainer.id = this.containerId;
        this.PanelContainer.innerHTML = `
            <div class="left-center-section">
                <div id="TopNav" class="ui-panel">
                    <tool-btn><i class="fa-solid fa-feather-pointed"></i> Interact</tool-btn>
                    <tool-btn><i class="fa-solid fa-paintbrush"></i> Paint</tool-btn>
                    <tool-btn><i class="fa-solid fa-mountain"></i> Terrain</tool-btn>
                    <tool-btn><i class="fa-solid fa-arrows-up-to-line"></i> Elevate</tool-btn>
                    <tool-btn><i class="fa-solid fa-cube"></i> Chunk</tool-btn>
                </div>
            </div>
            <div class="right-section">
                <div id="Sidebar" class="ui-panel"></div>
            </div>
        `;
        document.querySelector(containerSelector).style.position = 'relative';
        document.querySelector(containerSelector).appendChild(this.PanelContainer);
    }
}