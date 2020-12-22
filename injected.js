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
                this.changedCallback(mutation.addedNodes, mutation.removedNodes);
            }
        }
    }
}
// Hierarchy Classes
const grandParentViewCls = 'loWbp';
const parentViewCls = 'zWfAib'; // This is where all the top-level DIVs exist 
const childViewCls = 'Zf0RDc';

// View classes
const sideViewCls = 'PvRhvb';
const autoSideViewCls = 'WT4T8c';
const tileViewCls = 'xh9pFd';
const spotViewCls = 'n9oEIb'; // pinned view
const presentingView1Cls = 'CTSK6e';
const presentingView2Cls = 'SJniVb';
const autoTileViewCls = 'Qtgubc'; // 'eFmLfc' 

// New classes
const presenting = 'Qtgubc';
const tiles = 'eFmLfc';
const pinned = 'QhPhw'; // presenting or not
const sidebar = 'PvRhvb';


const watchedClasses = [autoSideViewCls, sideViewCls, tileViewCls, spotViewCls, presentingView1Cls, presentingView2Cls, autoTileViewCls];

// Auto, side: zWfAib Z319Jd PvRhvb a1pVef
// manual, side: zWfAib Z319Jd PvRhvb a1pVef
// manual side, spot: zWfAib Z319Jd n9oEIb a1pVef
// Auto, tiled, no pre: zWfAib Z319Jd a1pVef eFmLfc
// Manual, tiled, no pre: zWfAib Z319Jd eFmLfc t4HJue a1pVef CUJC3
// Tiles, spot: zWfAib Z319Jd a1pVef eFmLfc
// a1pVef --> unreliable

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

    function isGrandParent(node) {
        return node.classList && node.classList.contains(grandParentViewCls);
    }

    new ChildWatcher(root, (added, removed) => {
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
        return cl.contains(presentingView1Cls) || cl.contains(presentingView2Cls) ? 'presentingView' :
            cl.contains(autoSideViewCls) ? 'autoSideView' :
                cl.contains(sideViewCls) ? 'sideView' :
                    cl.contains(tileViewCls) ? 'tileView' :
                        cl.contains(spotViewCls) ? 'spotView' :
                            cl.contains(autoTileViewCls) ? 'autoTileView' :
                                undefined;
    }

    function isYeetable(viewMode) {
        const yeetables = ['presentingView', 'sideView', 'autoSideView', 'autoTileView'];
        return yeetables.indexOf(viewMode) >= 0;
    }

    function getViewModeFromClass(cls) {
        return cls ? (cls === presentingView1Cls || cls === presentingView2Cls ? 'presentingView' :
            cls === autoSideViewCls ? 'autoSideView' :
                cls === sideViewCls ? 'sideView' :
                    cls === tileViewCls ? 'tileView' :
                        cls === spotViewCls ? 'spotView' :
                            cls === autoTileViewCls ? 'autoTileView' :
                                undefined) : undefined;
    }

    function getFirstChild() {
        return parentView.querySelector(`.${childViewCls}[data-allocation-index="0"]`);
    }

    function getOtherChildren() {
        return parentView.querySelectorAll(`.${childViewCls}:not([data-allocation-index="0"])`);
    }

    function revert(viewMode) {
        log(`revert for ${viewMode}`);
        const mainVideo = getFirstChild();
        const sideVideos = getOtherChildren();

        if (viewMode === 'autoTileView') {
            mainVideo.style.transform = '';
            sideVideos.forEach(node => {
                node.style.transform = '';
            });
        } else {
            mainVideo.style.left = '';
            sideVideos.forEach(node => {
                node.style.left = '';
            });
        }
    }

    function updateButton() {
        const element = document.getElementById(buttonId);
        if (element) {
            const viewMode = getViewMode();
            if (isYeetable(viewMode)) {
                element.innerText = this.meetOnLeft ? 'Yeet Right' : 'Yeet Left';
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
            if (this.meetOnLeft && (added && added.length)) {
                if (isYeetable(getViewMode())) {
                    yeetLeft();
                }
                updateButton();
            }
        });

        classWatcher = new ClassWatcher(parentView, watchedClasses,
            () => {
                const viewMode = getViewMode();
                log(`View activated. Current: ${viewMode}`);

                if (this.meetOnLeft) {
                    toggleSide(true);
                }

                if (viewMode === 'spotView') {
                    const mainVideo = getFirstChild();
                    mainVideo.style.left = '';
                    mainVideo.style.transform = '';
                }

                updateButton();
            },
            (previousClass) => {
                const lastViewMode = getViewModeFromClass(previousClass);
                log(`View deactivated. Previous: ${lastViewMode}, Current: ${getViewMode()}`);
                // revert(lastViewMode);
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

        function yeetLeft() {
            const mainVideo = getFirstChild();
            mainVideo.style.zIndex = -1;

            const sideVideos = getOtherChildren();

            const viewMode = getViewMode();
            log(`left for ${viewMode}`);
            if (viewMode === 'autoTileView') {
                const mainWidth = parseInt(mainVideo.style.width);
                const sideWidth = mainVideo.parentElement.clientWidth - mainWidth;

                // Use translateX property, and keep the left property as it's being used by autoTileView
                mainVideo.style.transform = `translateX(${sideWidth}px)`;
                sideVideos.forEach(node => { node.style.transform = `translateX(-${mainWidth}px)`; });
            } else {
                mainVideo.style.transform = '';
                mainVideo.style.left = (viewMode === 'autoSideView' || viewMode === 'presentingView') ? '25%' : '218px';
                sideVideos.forEach(node => {
                    node.style.left = 0;
                    node.style.transform = '';
                });
            }
        }

        function toggleSide(forceLeft) {

            const viewMode = getViewMode();

            let meetOnLeft;
            if (isYeetable(viewMode)) {
                meetOnLeft = forceLeft || !this.meetOnLeft;
            }

            if (meetOnLeft === undefined) {
                log("Unsupported view mode. Please check that you're using a compatible layout.");
                return;
            }

            if (meetOnLeft) {
                yeetLeft();
            } else {
                revert(viewMode);
            }

            this.meetOnLeft = meetOnLeft;
            updateButton();
        }

        addButton();
    }
}

