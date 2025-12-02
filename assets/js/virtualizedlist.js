/*
    This code is the only reliable way I've found of making a virtualized
    list in vanilla JavaScript.

    It supports elements of variable height, has click and scroll event
    listeners, and doesn't use absolute positioning so it won't mess up
    your layout.

    Most of this code is AI generated, something I'm usually against,
    but I seriously found no better human-written alternative.

    Enjoy, and feel free to use it in your project if you need it :)
*/
// tags (so people can find this in GitHub's code search):
// virtual list, virtualized list, list virtualization, vanilla JS, vanilla JavaScript

export default class VirtualizedList {
    constructor({ container, items, initialItemHeights, renderFunction, onScroll = null, onClick = null, manualClassName }) {
        this.container = container;
        this.items = items;
        this.renderFunction = renderFunction;
        this.itemHeights = initialItemHeights;
        this.itemOffsets = [];
        this.visibleItems = {};
        this.startIndex = null;
        this.endIndex = null;
        this.onScroll = onScroll;
        this.onClick = onClick;
        this.bufferSize = 10;
        this.manualClassName = manualClassName;

        this.initializeOffsets();
        this.setupContainer();
    }

    initializeOffsets() {
        this.itemOffsets[0] = 0;
        for (let i = 1; i < this.itemHeights.length; i++) {
            this.itemOffsets[i] = this.itemOffsets[i - 1] + this.itemHeights[i - 1];
        }
    }

    setupContainer() {
        this.container.style.position = "relative";
        this.container.style.overflowY = "auto";

        this.topSpacer = document.createElement("div");
        this.bottomSpacer = document.createElement("div");
        this.topSpacer.style.height = "0px";
        this.bottomSpacer.style.height = `${this.totalHeight()}px`;

        this.container.appendChild(this.topSpacer);
        this.container.appendChild(this.bottomSpacer);
        this.container.addEventListener("scroll", this.handleScroll.bind(this));

        this.render();
    }

    totalHeight() {
        return (
            this.itemOffsets[this.items.length - 1] + this.itemHeights[this.itemHeights.length - 1]
        );
    }

    findStartIndex(scrollTop) {
        let low = 0;
        let high = this.itemOffsets.length - 1;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (this.itemOffsets[mid] < scrollTop) {
                low = mid + 1;
            } else {
                high = mid;
            };
        };

        return this.itemOffsets[low] > scrollTop ? Math.max(0, low - 1) : low;
    }

    handleScroll() {
        if (this.onScroll) this.onScroll(this.container.scrollTop);
        this.render();
    }

    render() {
        const scrollTop = this.container.scrollTop;
        const viewportHeight = this.container.offsetHeight;

        const startIndex = Math.max(this.findStartIndex(scrollTop) - this.bufferSize, 0);
        const visibleEnd = this.findStartIndex(scrollTop + viewportHeight);
        const endIndex = Math.min(visibleEnd + this.bufferSize, this.items.length); 

        if (startIndex === this.startIndex && endIndex === this.endIndex) return;

        const topSpacerHeight = this.itemOffsets[startIndex] || 0;
        this.topSpacer.style.height = `${topSpacerHeight}px`;

        const bottomSpacerHeight = this.totalHeight() - (this.itemOffsets[endIndex] || topSpacerHeight);

        if (endIndex >= this.items.length) this.bottomSpacer.style.display = "none";
        else {
            this.bottomSpacer.style.display = "block";
            this.bottomSpacer.style.height = `${bottomSpacerHeight}px`;
        };

        const fragment = document.createDocumentFragment();
        for (let i = startIndex; i < endIndex; i++) {
            let itemDiv = this.visibleItems[i];

            if (!itemDiv) {
                itemDiv = document.createElement("div");
                
                const content = this.renderFunction(this.items[i], i);
                itemDiv.innerHTML = content;
                itemDiv = itemDiv.children[0];
                if (this.onClick) {
                    itemDiv.addEventListener("click", e => this.onClick(e));
                };

                itemDiv.addEventListener("load", () => this.updateItemHeight(i, itemDiv), {
                    once: true,
                });

                this.visibleItems[i] = itemDiv;
            };

            fragment.appendChild(itemDiv);
        };

        Array.from(this.container.children)
            .filter((child) => child !== this.topSpacer && child !== this.bottomSpacer)
            .forEach((item) => {
                if (!this.visibleItems[+item.dataset.index] && !item.classList.contains(this.manualClassName)) this.container.removeChild(item);
            });
        this.container.insertBefore(fragment, this.bottomSpacer);

        this.startIndex = startIndex;
        this.endIndex = endIndex;
    }

    updateItemHeight(index, itemDiv) {
        const newHeight = itemDiv.offsetHeight;
        if (newHeight && newHeight !== this.itemHeights[index]) {
            const heightDiff = newHeight - this.itemHeights[index];
            this.itemHeights[index] = newHeight;

            for (let j = index + 1; j < this.itemOffsets.length; j++) this.itemOffsets[j] += heightDiff;
            if (this.endIndex < this.items.length) this.bottomSpacer.style.height = `${this.totalHeight() - this.container.scrollTop}px`;

            this.render();
        };
    }

    scrollToIndex(index, start = false, smooth = false) {
        if (index < 0 || index >= this.items.length) {
            console.error(`Index out of bounds: ${index}`);
            return;
        };

        const targetOffset = this.itemOffsets[index];
        this.container.scrollTo({
            top: start ? targetOffset : targetOffset - window.innerHeight / 2 + this.itemHeights[index] / 2,
            behavior: smooth ? "smooth" : "instant"
        });

        this.render();
    }
}