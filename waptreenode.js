'use strict'

class WAPTreeNode {
    constructor(parent, event, count) {
        this.parent = parent
        this.event = event
        this.count = count
        if (parent != null) {
            parent.addChild(this)
        }
        this.children = null
        
    }

    addChild(child) {
        if (this.children == null) {
            this.children = new Object()
        }
        this.children[child.event.id] = child
    }

    static rootNode() {
        return new WAPTreeNode(null, null, 0)
    }
}

module.exports = WAPTreeNode