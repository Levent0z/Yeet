const log = (...args) => {
    console.debug(
        '%cYeet',
        'color:#333;background-color:lightgreen;font-weight:bold',
        ...args,
    );
};
log('Starting up...')

// Hierarchy Classes
const grandParentViewCls = 'loWbp';
const parentViewCls = 'zWfAib'; // This is where all the top-level DIVs exist 
const childViewCls = 'Zf0RDc';

// View classes
const clsPresenting = 'Qtgubc';
const clsTiles = 'eFmLfc';
const clsPinned = 'QhPhw'; // presenting or not
const clsSidebar = 'PvRhvb';

// View names
const vwPresenting = 'presenting';
const vwTiles = 'tiles';
const vwPinned = 'pinned';
const vwSidebar = 'sidebar';

// Button stuff
const buttonId = 'yeet-toggle-side';
const buttonParentCls = 'NzPR9b';
const buttonClasses = ['uArJ5e', 'UQuaGc', 'kCyAyd', 'QU4Gid', 'foXzLb'];
const buttonSeparatorCls = 'qO3Z3c';

// Default to true
let meetOnLeft = true;
let classWatcher;
let childWatcher;
let parentView;
let currentViewMode;
let currentChild;


// https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

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

function isYeetable() {
    if (currentViewMode === vwPresenting || currentViewMode === vwSidebar) {
        const mainVideo = getChild();
        const mainStyle = getComputedStyle(mainVideo);
        const mainWidth = parseInt(mainStyle.width);
        const mainBottom = parseInt(mainStyle.top) + parseInt(mainStyle.height);
        const sideWidth = mainVideo.parentElement.clientWidth - mainWidth;
        const secondTop = parseInt(getComputedStyle(getChild(1)).top);

        // Make sure that the tiles haven't arranged below the main
        return sideWidth > 0 && (secondTop < mainBottom);
    }
    return false;
}

function getViewModeFromClass(cls) {
    return cls === clsPresenting ? vwPresenting : cls === clsTiles ? vwTiles : cls === clsPinned ? vwPinned : cls === clsSidebar ? vwSidebar : undefined;
}

function getChild(index) {
    index = index || 0;
    return parentView.querySelector(`.${childViewCls}[data-allocation-index="${index}"]`);
}
function getOtherChildren() {
    return parentView.querySelectorAll(`.${childViewCls}:not([data-allocation-index="0"])`);
}

function revert() {
    log('Reverting');
    const mainVideo = getChild();
    const sideVideos = getOtherChildren();

    mainVideo.style.transform = '';
    sideVideos.forEach(node => {
        node.style.transform = '';
    });
}

function updateButton(enabled) {
    if (enabled === undefined) {
        enabled = isYeetable();
    }
    const element = document.getElementById(buttonId);
    if (element) {
        if (enabled) {
            element.innerText = meetOnLeft ? 'Yeet >>' : 'Yeet <<';
            // element.innerHTML = // SVG viewBox = 0 0 24 24 ( width: 24px height: 24px)
        } else {
            element.innerText = "Can't Yeet RN";
        }
    }
}

function transitionStyle(element) {
    element.style.transition = '';
    const existing = getComputedStyle(element).transition;
    if (existing.indexOf('transform') < 0) {
        element.style.transition = `${existing}${existing.length ? ', ' : ''}transform 0.5s ease 0s`;
    }
}

function updatePositionsImmediate() {
    log('Updating positions');

    let isKnownYeetable;
    if (meetOnLeft && isYeetable()) {
        isKnownYeetable = true; // Minor optimization

        // In addition to updating positions, we also add transitions for transforms here.
        const mainChild = getChild();
        const mainWidth = parseInt(getComputedStyle(mainChild).width);
        const sideWidth = mainChild.parentElement.clientWidth - mainWidth;

        transitionStyle(mainChild);
        mainChild.style.transform = `translateX(${sideWidth}px)`;

        getOtherChildren().forEach(otherChild => {
            transitionStyle(otherChild);
            otherChild.style.transform = `translateX(-${mainWidth}px)`;
        });

    } else {
        revert();
    }
    updateButton(isKnownYeetable);
}

function styleWatch() {
    // Watching second child.
    const child = getChild(1);
    if (child !== currentChild) {
        currentChild = child;
        if (styleWatcher) {
            styleWatcher.disconnect();
            styleWatcher = undefined;
        }
        if (currentChild) {
            styleWatcher = new StyleWatcher(currentChild, (beforeMap, afterMap) => {
                const set = new Set();
                Object.keys(beforeMap).forEach(k => set.add(k));
                Object.keys(afterMap).forEach(k => set.add(k));

                let adjust = false;
                Array.from(set.keys()).forEach(k => {
                    const beforeVal = beforeMap[k];
                    const afterVal = afterMap[k];
                    if (beforeVal !== afterVal) {
                        log(`Changed ${k}: ${beforeVal} --> ${afterVal}`);
                        adjust = ['width', 'height', 'top', 'bottom', 'left', 'right'].indexOf(k) >= 0;
                    }
                });
                if (adjust) {
                    updatePositionsDelayed();
                }
            });
        }
    }
}

function onViewChanged() {
    updatePositionsDelayed();
}

function onYeetClick() {
    if(isYeetable()) {
        meetOnLeft = !meetOnLeft;
        // No debounce
        updatePositionsImmediate();
    }
}


function addButton() {
    const element = document.createElement('div');
    element.setAttribute('id', buttonId)
    element.classList.add(...buttonClasses);
    element.style.display = 'flex';
    element.style.marginLeft = '15px';
    element.style.marginRight = '15px';
    element.style.lineHeight = 'normal';
    element.addEventListener('click', onYeetClick);

    const separator = document.createElement('div');
    separator.classList.add(buttonSeparatorCls);

    const parent = document.querySelector(`.${buttonParentCls}`);
    parent.insertAdjacentElement('afterbegin', separator);
    parent.insertAdjacentElement('afterbegin', element);

    updateButton();
}

function initializeParent() {
    log('Watching...');

    childWatcher = new ChildWatcher(parentView, () => {
        // Make sure the first child always stays behind others
        getChild().style.zIndex = -1;
        updatePositionsDelayed();
    });

    classWatcher = new ClassWatcher(parentView,
        (beforeOnly, afterOnly) => {
            for (const cls of afterOnly) {
                const viewMode = getViewModeFromClass(cls);
                if (viewMode) {
                    log(`View ${viewMode} activated. Current: ${currentViewMode}`);
                    if (currentViewMode !== viewMode) {
                        currentViewMode = viewMode;
                        onViewChanged();
                    }
                }
            }
        }
    );
}

const updatePositionsDelayed = debounce(updatePositionsImmediate, 510);

function deactivate() {
    log('Deactivate');
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

    window.removeEventListener('resize', updatePositionsDelayed);
}


function activate() {
    log('Activate');
    initializeParent();
    addButton();
    window.addEventListener('resize', updatePositionsDelayed);
}

const root = document.querySelector('[jsname=RFn3Rd]');
if (!root) {
    log('Root element not found');
} else {
    new ChildWatcher(root, (removed, added) => {
        // Notify removed nodes first
        removed.forEach(node => {
            if (node.classList && node.classList.contains(grandParentViewCls)) {
                deactivate();
            }
        });
        added.forEach(node => {
            if (!parentView) {
                parentView = node.querySelector(`.${parentViewCls}`);
                if (parentView) {
                    activate();
                }
            }
        });
    });
}
