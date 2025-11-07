const emptyClass = class {}
export const Serializable = (superclass=emptyClass) => class extends superclass {
    constructor(attr) {
        super();
        this._attr_to_serialize = attr;
    }
    static fromObject(json) {
    }
}