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

    hasChild(eventId) {
        return this.children != null && this.children[eventId] != null
    }

    getChild(eventId) {
        if (this.children != null) {
            return this.children[eventId]
        } else {
            return null
        }
    }

    addCount(count) {
        this.count = this.count + count
    }

    getPrefixEvents() {
        let events = new Array()
        var currentNode = this.parent
        while(currentNode != null && currentNode.event != null) {
            events.push(currentNode.event)
            currentNode = currentNode.parent
        }
        return events.reverse()
    }

    static rootNode() {
        return new WAPTreeNode(null, null, 0)
    }
}

module.exports = WAPTreeNode