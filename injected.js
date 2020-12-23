const log = (...args) => {
    console.debug(
        '%cYeet',
        'color:#333;background-color:lightgreen;font-weight:bold',
        ...args,
    );
};
log('starting up...')

// Default to true
let meetOnLeft = true;

// Hierarchy Classes
const grandParentViewCls = 'loWbp';
const parentViewCls = 'zWfAib'; // This is where all the top-level DIVs exist 
const childViewCls = 'Zf0RDc';

// View classes
const presenting = 'Qtgubc';
const tiles = 'eFmLfc';
const pinned = 'QhPhw'; // presenting or not
const sidebar = 'PvRhvb';

// Button Classes
const buttonParentCls = 'NzPR9b';
const buttonClasses = ['uArJ5e', 'UQuaGc', 'kCyAyd', 'kW31ib', 'foXzLb'];
const buttonSeparatorCls = 'qO3Z3c';

const buttonId = 'yeet-toggle-side';


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
            const before = mutation.oldValue ? mutation.oldValue.split(';') : [];
            const beforeMap = {};
            before.forEach(item => {
                if (item) {
                    const exp = item.split(':');
                    const key = exp[0].trim();
                    const value = exp[1].trim();
                    beforeMap[key] = value;
                }
            });

            const afterMap = {};
            const style = mutation.target.style;
            Array.from(style).forEach(key => {
                afterMap[key] = style[key];
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



const root = document.querySelector('[jsname=RFn3Rd]');
if (!root) {
    log('Root element not found');
} else {

    let classWatcher;
    let childWatcher;
    let parentView;
    let currentMainView;
    let styleWatcher;
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
                    classWatcher = undefined;
                }
                if (childWatcher) {
                    childWatcher.disconnect();
                    childWatcher = undefined;
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
    function getSecondChild() {
        return parentView.querySelector(`.${childViewCls}[data-allocation-index="1"]`);
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
                element.innerText = meetOnLeft ? 'Yeet>>' : 'Yeet<<';
                // element.innerHTML = // SVG viewBox = 0 0 24 24 ( width: 24px height: 24px)
            } else {
                element.innerText = "Can't Yeet RN";
            }
        }
    }

    function updateMainView() {
        // const mainView = getFirstChild();
        const mainView = getSecondChild();
        if (mainView !== currentMainView) {
            currentMainView = mainView;
            if (styleWatcher) {
                styleWatcher.disconnect();
                styleWatcher = undefined;
            }
            if (currentMainView) {
                styleWatcher = new StyleWatcher(currentMainView, (beforeMap, afterMap) => {
                    const set = new Set();
                    Object.keys(beforeMap).forEach(k => set.add(k));
                    Object.keys(afterMap).forEach(k => set.add(k));

                    let adjust = false;
                    Array.from(set.keys()).forEach(k => {
                        const beforeVal = beforeMap[k];
                        const afterVal = afterMap[k];
                        if (beforeVal !== afterVal) {
                            console.log(`Changed ${k}: ${beforeVal} --> ${afterVal}`);
                            switch (k) {
                                case 'width':
                                case 'height':
                                case 'top':
                                case 'bottom':
                                case 'left':
                                case 'right':
                                    adjust = true;
                                    break;
                            }
                        }
                    });
                    if (adjust) {
                        updatePositions();
                    }
                });
            }
        }
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
        let yeet = false;

        if (isYeetable() && meetOnLeft) {
            const mainVideo = getFirstChild();
            mainVideo.style.zIndex = -1;
            addTransformToTransition(mainVideo);

            const mainStyle = getComputedStyle(mainVideo);
            const mainWidth = parseInt(mainStyle.width);
            const mainHeight = parseInt(mainStyle.height);
            const mainTop = parseInt(mainStyle.top)

            const sideWidth = mainVideo.parentElement.clientWidth - mainWidth;

            const secondTop = parseInt(getComputedStyle(getSecondChild()).top);

            if (sideWidth > 0 && (secondTop < mainTop + mainHeight)) {
                // Use translateX property, and keep the left property as it's being used by autoTileView
                mainVideo.style.transform = `translateX(${sideWidth}px)`;

                const sideVideos = getOtherChildren();
                sideVideos.forEach(node => {
                    addTransformToTransition(node);
                    node.style.transform = `translateX(-${mainWidth}px)`;
                });
                yeet = true;
            } 
        } 
        
        if (!yeet) {
            revert();
        }
        updateButton();
    }

    function initializeParent() {
        log('watching...');

        childWatcher = new ChildWatcher(parentView, () => { updatePositions(); });

        classWatcher = new ClassWatcher(parentView,
            (beforeOnly, afterOnly) => {
                for (const cls of afterOnly) {
                    const viewMode = getViewModeFromClass(cls);
                    if (viewMode) {
                        log(`View ${viewMode} activated. Current: ${currentViewMode}`);
                        if (currentViewMode !== viewMode) {
                            currentViewMode = viewMode;
                            toggleSide(meetOnLeft);
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
            element.addEventListener('click', () => { isYeetable() && toggleSide(); });

            const separator = document.createElement('div');
            separator.classList.add(buttonSeparatorCls);

            const parent = document.querySelector(`.${buttonParentCls}`);
            parent.insertAdjacentElement('afterbegin', separator);
            parent.insertAdjacentElement('afterbegin', element);

            updateButton();
        }

        function toggleSide(forceLeft) {
            meetOnLeft = forceLeft || !meetOnLeft;
            updatePositions();
            updateButton();
        }

        addButton();

        window.addEventListener('resize', () => {
            updatePositions();
        });
    }
}

