import Tool from '../supers/Tool.js';
import { WorldQuill } from '../WorldQuill.js';

export default class ImportTool extends Tool {
    constructor() {
        super('import', 'p');
        this.name = 'Import Chunk(s)';
        this.label = 'Import';
        this.icon = 'fa-solid fa-upload';
        this.description = `Take other creations for yourself or others and add them to your world! Begin by find a design <a href="/browse/" target="_blank">here</a>, or by copying an existing chunk in this world using the Chunk Manager tool.`;
    }
    onActivate(args) {
        this.mapJson = null;
        this.#setUiDetails();

        this.#loadRequestedMap();
    }
    onDeactivate() {
    }
    onDown(args) {
    }
    onMove(args) {
    }
    onHoverMove(args) {
    }
    onUp(args) {
    }
    onClick(args) {
    }




    #loadRequestedMap() {
        let key = 'thisIsTheChunkToolFromWorldQuill.CouldYouPleasePasteThisJson';
        if (sessionStorage.getItem(key)){
            this.#parseClipboard(sessionStorage.getItem(key));
            sessionStorage.removeItem(key);
        }
    }
    #loadMapPreview() {
        let chunkPreviewContainer = WorldQuill.PanelManager.SidebarDetailsEl.querySelector('#chunkPreviewContainer');
        if (!chunkPreviewContainer) return;

        chunkPreviewContainer.querySelector('iframe').src = 'preview.html#' + encodeURIComponent(JSON.stringify(this.mapJson));

        chunkPreviewContainer.style.display = 'flex';
    }



    async #parseClipboard(clipText) {
        // attempt to parse as JSON
        let parsedJson;
        try {
            parsedJson = JSON.parse(clipText);
        } catch(err) {
            alert('Uh oh. Looks like that wasn\'t a valid WorldQuill object. Please re-copy it and try again.');
        }
        if (!parsedJson) return console.error('clipText could not be parsed as JSON', clipText);


        // validate JSON
        let valid = (()=>{
            if (!parsedJson.children) return false;
            if (parsedJson.children.length == 0) return false;
            if (!parsedJson.children.every(c => {
                c.l && Array.isArray(c.l) && c.l.length == 2 &&
                c.c && Array.isArray(c.c) && c.c.length == chunkWidthInTiles*chunkWidthInTiles &&
                c.e && Array.isArray(c.e)
            })) return false;
            return true;
        });
        if (!valid) return alert('Oh no! It looks like something may be wrong with the WorldQuill object you pasted. Please re-copy it and try again.');

        this.mapJson = parsedJson;
        this.#loadMapPreview();        
    }

    
    // UI
    #setUiDetails() {
        WorldQuill.PanelManager.setDetails([
            {
                type: 'button',
                attrs: [
                    ['style', ' font-size: 1em; flex: 1; margin-bottom: 1em;'],
                    ['onclick', this.btn_pasteFromClipboard.bind(this)]
                ],
                content: 'Paste from Clipboard <i class="fa-regular fa-clipboard"></i>'
            },
            {
                type: 'div',
                attrs: [
                    ['id', 'chunkPreviewContainer'], ['style', `display: none; flex-direction: column; align-items: stretch; gap: 0.5em;`],
                ],
                children: [
                    {
                        type: 'i',
                        attrs: [['style', 'text-align: center; margin-bottom: 0.5em;']],
                        content: 'Preview:',
                    },
                    {
                        type: 'iframe',
                        attrs: [
                            ['src', ''],
                            ['style', 'aspect-ratio: 1; width: 100%; border-radius: 10px; border: 4px solid #d4cfa8; box-sizing: border-box;'],
                        ],
                        content: 'Remove'
                    },
                    {
                        type: 'button',
                        attrs: [
                            ['style', ' font-size: 1em']
                        ],
                        content: 'Place'
                    }
                ]
            }
        ]);
    }
    async btn_pasteFromClipboard() {
        // attempt to get clipboard text
        let clipText;
        try {
            clipText = await navigator.clipboard.readText();
        } catch(err) {
            alert('It looks like you didn\'t give permission for reading your clipboard. Please click on the lock at far left of the address bar, then allow clipboard permissions.');
        }
        if (!clipText) return console.error('clipboard access not given');

        this.#parseClipboard(clipText);
    }
}