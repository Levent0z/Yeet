const log = (...args) => {
    console.debug(
        '%cYeet',
        'color:#333;background-color:lightgreen;font-weight:bold',
        ...args,
    );
};
log('starting up...')

// Based on https://stackoverflow.com/questions/10612024/event-trigger-on-a-class-change?lq=1
class ClassWatcher {
    constructor(targetNode, classChangedCallback) {
        this.targetNode = targetNode
        this.classChangedCallback = classChangedCallback
        this.observer = new MutationObserver(this.mutationCallback.bind(this));
        this.observe();
    }

    observe() {
        this.observer.observe(this.targetNode, {
            attributes: true,
            attributeFilter: ['class'],
            attributeOldValue: true
        });
    }

    disconnect() {
        this.observer.disconnect()
    }

    mutationCallback(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.oldValue !== mutation.target.classList.value) {
                const before = mutation.oldValue ? mutation.oldValue.split(' ') : [];
                const after = (mutation.target.classList && mutation.target.classList.value) ? mutation.target.classList.value.split(' ') : [];

                const beforeOnly = before.filter(b => after.indexOf(b) < 0);
                const afterOnly = after.filter(a => before.indexOf(a) < 0);

                this.classChangedCallback(beforeOnly, afterOnly);
            }
        }
    }
}

class StyleWatcher {
    constructor(targetNode, sytleChangedCallback) {
        this.targetNode = targetNode
        this.styleChangedCallback = sytleChangedCallback
        this.observer = new MutationObserver(this.mutationCallback.bind(this));
        this.observe();
    }

    observe() {
        this.observer.observe(this.targetNode, {
            attributes: true,
            attributeFilter: ['style'],
            attributeOldValue: true
        });
    }

    disconnect() {
        this.observer.disconnect()
    }

    mutationCallback(mutationsList) {
        for (const mutation of mutationsList) {
            const target = mutation.target;
            const before = mutation.oldValue ? mutation.oldValue.split(' ') : [];
            const beforeMap = {};
            for (let i = 0; i < before.length; i += 2) {
                const key = before[i].substring(0, before[i].length - 1);
                const value = before[i + 1].substring(0, before[i + 1].length - 1);
                beforeMap[key] = value;

            }
            const afterMap = {};
            Array.from(target.style).forEach(key => {
                afterMap[key] = target.style[key];
            });
            this.styleChangedCallback(beforeMap, afterMap);
        }
    }
}

class ChildWatcher {
    constructor(targetNode, changedCallback) {
        this.targetNode = targetNode
        this.changedCallback = changedCallback
        this.observer = new MutationObserver(this.mutationCallback)
        this.observe()
    }

    observe() {
        this.observer.observe(this.targetNode, { childList: true })
    }

    disconnect() {
        this.observer.disconnect()
    }

    mutationCallback = mutationsList => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                this.changedCallback(mutation.removedNodes, mutation.addedNodes);
            }
        }
    }
}
// Hierarchy Classes
const grandParentViewCls = 'loWbp';
const parentViewCls = 'zWfAib'; // This is where all the top-level DIVs exist 
const childViewCls = 'Zf0RDc';


// New classes
const presenting = 'Qtgubc';
const tiles = 'eFmLfc';
const pinned = 'QhPhw'; // presenting or not
const sidebar = 'PvRhvb';


// Button Classes
const buttonParentCls = 'NzPR9b';
const buttonClasses = ['uArJ5e', 'UQuaGc', 'kCyAyd', 'kW31ib', 'foXzLb'];
const buttonSeparatorCls = 'qO3Z3c';

const buttonId = 'yeet-toggle-side';

const root = document.querySelector('[jsname=RFn3Rd]');
if (!root) {
    log('Root element not found');
} else {

    let classWatcher;
    let parentView;
    let currentViewMode;

    function isGrandParent(node) {
        return node.classList && node.classList.contains(grandParentViewCls);
    }

    new ChildWatcher(root, (removed, added) => {
        // Notify removed nodes first
        removed.forEach(node => {
            if (isGrandParent(node)) {
                log('Grandparent Lost');
                if (classWatcher) {
                    classWatcher.disconnect();
                }
                const button = document.getElementById(buttonId);
                if (button) {
                    button.parentNode.removeChild(button);
                }
            }
        });
        added.forEach(node => {
            if (!parentView) {
                parentView = node.querySelector(`.${parentViewCls}`);
                if (!parentView) {
                    return;
                }
                initializeParent();
            }
        });
    });


    function getViewMode() {
        const cl = parentView.classList;
        return cl.contains(presenting) ? 'presenting' :
            cl.contains(tiles) ? 'tiles' :
                cl.contains(pinned) ? 'pinned' :
                    cl.contains(sidebar) ? 'sidebar' :
                        undefined;
    }

    function isYeetable() {
        const viewMode = getViewMode();
        const yeetables = ['presenting', 'sidebar'];
        return yeetables.indexOf(viewMode) >= 0;
    }

    function getViewModeFromClass(cls) {
        return cls ? (cls === presenting ? 'presenting' :
            cls === tiles ? 'tiles' :
                cls === pinned ? 'pinned' :
                    cls === sidebar ? 'sidebar' :
                        undefined) : undefined;
    }

    function getFirstChild() {
        return parentView.querySelector(`.${childViewCls}[data-allocation-index="0"]`);
    }

    function getOtherChildren() {
        return parentView.querySelectorAll(`.${childViewCls}:not([data-allocation-index="0"])`);
    }

    function revert() {
        log('Reverting');
        const mainVideo = getFirstChild();
        const sideVideos = getOtherChildren();

        mainVideo.style.transform = '';
        sideVideos.forEach(node => {
            node.style.transform = '';
        });
    }

    function updateButton() {
        const element = document.getElementById(buttonId);
        if (element) {
            if (isYeetable()) {
                element.innerText = this.meetOnLeft ? '> Yeet >' : '< Yeet <';
                // element.innerHTML = // SVG viewBox = 0 0 24 24 ( width: 24px height: 24px)
            } else {
                element.innerText = "Can't Yeet RN";
            }
        }
    }

    function initializeParent() {
        log('watching...');
        // Default to true
        this.meetOnLeft = true;

        new ChildWatcher(parentView, (added, removed) => {
            if (added && added.length) {
                if (this.meetOnLeft && isYeetable()) {
                    updatePositions();
                }
                updateButton();
            }
        });

        classWatcher = new ClassWatcher(parentView,
            (beforeOnly, afterOnly) => {
                for (const cls of afterOnly) {
                    const viewMode = getViewModeFromClass(cls);
                    if (viewMode) {
                        log(`View ${viewMode} activated. Current: ${currentViewMode}`);
                        if (currentViewMode !== viewMode) {
                            currentViewMode = viewMode;
                            toggleSide(this.meetOnLeft);
                        }
                    }
                }
            }
        );

        function addButton() {
            const element = document.createElement('div');
            element.setAttribute('id', buttonId)
            element.classList.add(...buttonClasses);
            element.style.display = 'flex';
            element.style.marginLeft = '15px';
            element.style.marginRight = '15px';
            element.addEventListener('click', () => { toggleSide(); });

            const separator = document.createElement('div');
            separator.classList.add(buttonSeparatorCls);

            const parent = document.querySelector(`.${buttonParentCls}`);
            parent.insertAdjacentElement('afterbegin', separator);
            parent.insertAdjacentElement('afterbegin', element);

            updateButton();
        }

        function addTransformToTransition(element) {
            element.style.transition = '';
            const existing = getComputedStyle(element).transition;
            if (existing.indexOf('transform') < 0) {
                element.style.transition = `${existing}${existing.length ? ', ' : ''}transform 0.5s ease 0s`;
            }
        }


        function updatePositions() {
            log('Updating positions');

            const mainVideo = getFirstChild();
            mainVideo.style.zIndex = -1;
            addTransformToTransition(mainVideo);

            const mainWidth = parseInt(getComputedStyle(mainVideo).width);
            const sideWidth = mainVideo.parentElement.clientWidth - mainWidth;

            if (this.meetOnLeft && sideWidth > 0) {
                // Use translateX property, and keep the left property as it's being used by autoTileView
                mainVideo.style.transform = `translateX(${sideWidth}px)`;

                const sideVideos = getOtherChildren();
                sideVideos.forEach(node => {
                    addTransformToTransition(node);
                    node.style.transform = `translateX(-${mainWidth}px)`;
                });
            } else {
                revert();
            }
        }

        function toggleSide(forceLeft) {
            if (isYeetable()) {
                this.meetOnLeft = forceLeft || !this.meetOnLeft;
                updatePositions();
            } else {
                revert();
            }
            updateButton();
        }

        addButton();
    }
}

