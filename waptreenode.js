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

    getOneBranchSuffixEvents() {
        let events = new Array()
        var temp = this.children
        while(temp != null) {
            let childrenIds = Object.keys(temp)
            if (childrenIds.length == 0) {
                return events
            } else {
                events.push(temp[childrenIds[0]].event)
                temp = temp[childrenIds[0]].children
            }
        }
        return events
    }

    hasOnlyOneBranch() {
        var temp = this.children
        while (temp != null) {
            let childrenIds = Object.keys(temp)
            if (childrenIds.length > 1) {
                return false
            } else {
                temp = temp[childrenIds[0]].children
            }
        }
        return true
    }

    static rootNode() {
        return new WAPTreeNode(null, null, 0)
    }
}

module.exports = WAPTreeNode