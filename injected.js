'use strict';
/*
    Written by Levent Oz
    http://www.leventoz.com/
    https://github.com/Levent0z/Yeet
*/

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
const buttonTextCls = 'yeet-text';
const buttonParentCls = 'NzPR9b';
const buttonClasses = ['uArJ5e', 'UQuaGc', 'kCyAyd', 'QU4Gid', 'foXzLb'];
const buttonSeparatorCls = 'qO3Z3c';
const buttonDownCls = 'qs41qe';
const buttonUpCls = 'j7nIZb';
const buttonChild1Classes = ['Fvio9d', 'MbhUzd'];
const buttonChild2Classes = ['e19J0b', 'CeoRYc'];

// Default to true
let meetOnLeft = true;
let classWatcher;
let childWatcher;
let parentStyleWatcher;
let childStyleWatcher;
let parentView;
let currentViewMode;
let currentSecondChild;


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
        if (!mainVideo) {
            return false;
        }
        const mainStyle = getComputedStyle(mainVideo);
        const mainWidth = parseInt(mainStyle.width);
        const mainBottom = parseInt(mainStyle.top) + parseInt(mainStyle.height);
        const sideWidth = mainVideo.parentElement.clientWidth - mainWidth;

        const secondVideo = getChild(1);
        if (!secondVideo) {
            return false;
        }
        const secondTop = parseInt(getComputedStyle(secondVideo).top);

        // Make sure that the tiles haven't arranged below the main
        return sideWidth > 0 && (secondTop < mainBottom);
    }
    return false;
}

function getViewModeFromClass(cls) {
    return cls === clsPresenting ? vwPresenting : cls === clsTiles ? vwTiles : cls === clsPinned ? vwPinned : cls === clsSidebar ? vwSidebar : undefined;
}

function getChild(index) {
    try {
        return parentView.querySelector(`.${childViewCls}[data-allocation-index="${index || 0}"]`);
    } catch {
        return undefined;
    }
}

function getOtherChildren() {
    return parentView.querySelectorAll(`.${childViewCls}:not([data-allocation-index="0"])`);
}

function revert() {
    log('Reverting');
    if (parentView) {
        parentView.querySelectorAll(`.${childViewCls}`).forEach(node => {
            node.style.transform = '';
        });
    }
}

function updateButton(enabled) {
    if (enabled === undefined) {
        enabled = isYeetable();
    }
    const element = document.getElementById(buttonId);
    if (element) {
        const span = element.querySelector(`.${buttonTextCls}`);
        if (enabled) {
            span.innerText = meetOnLeft ? 'Yeet >>' : 'Yeet <<';
        } else {
            span.innerText = "Can't Yeet RN";
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
    let isKnownYeetable;
    if (meetOnLeft && isYeetable()) {
        log('Yeeting');
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

function styleWatchOnParent() {
    parentStyleWatcher = styleWatchOnNode(parentView, parentStyleWatcher);
}

function styleWatchOnChild() {
    // Watching second child.
    const child = getChild(1);
    if (!child || child !== currentSecondChild) {
        currentSecondChild = child;
        childStyleWatcher = styleWatchOnNode(child, childStyleWatcher);
    }
}

function styleWatchOnNode(node, existingWatcher) {
    if (existingWatcher) {
        existingWatcher.disconnect();
    }
    return node ? new StyleWatcher(node, (beforeMap, afterMap) => {
        const set = new Set();
        Object.keys(beforeMap).forEach(k => set.add(k));
        Object.keys(afterMap).forEach(k => set.add(k));

        let adjust = false;
        Array.from(set.keys()).forEach(k => {
            const beforeVal = beforeMap[k];
            const afterVal = afterMap[k];
            if (beforeVal !== afterVal) {
                adjust = ['width', 'height', 'top', 'bottom', 'left', 'right'].indexOf(k) >= 0;
            }
        });
        if (adjust) {
            log(`Delayed update due to style change on ${node.tagName}.${node.className}`);
            updatePositionsDelayed();
        }
    }) : undefined;
}

function onViewChanged() {
    log('Delayed update due to view change');
    updatePositionsDelayed();
}

function onYeetClick() {
    if (isYeetable()) {
        meetOnLeft = !meetOnLeft;
        // No debounce
        log('Immediate update due to click');
        updatePositionsImmediate();
    }
}


function addButton() {
    const element = document.createElement('div');
    element.setAttribute('id', buttonId)
    element.classList.add(...buttonClasses);
    element.style.display = 'flex';
    // element.style.marginLeft = '15px';
    // element.style.marginRight = '15px';
    element.style.lineHeight = 'normal';
    element.addEventListener('mousedown', () => {
        if (isYeetable()) {
            element.classList.remove(buttonUpCls);
            element.classList.add(buttonDownCls);
        }
    });
    element.addEventListener('mouseup', () => {
        element.classList.remove(buttonDownCls);
        element.classList.add(buttonUpCls);
    });
    element.addEventListener('mouseleave', () => {
        element.classList.remove(buttonDownCls);
        element.classList.add(buttonUpCls);
    });

    element.addEventListener('click', onYeetClick);

    let child = document.createElement('span');
    child.style.paddingLeft = '15px';
    child.style.paddingRight = '15px';
    child.classList.add(buttonTextCls);
    element.append(child);

    // Click Effect
    child = document.createElement('div');
    child.classList.add(...buttonChild1Classes);
    child.style.top = '21px';
    child.style.left = '35px';
    child.style.width = '72px';
    child.style.height = '72px';
    //child.setAttribute('jsname', 'ksKsZd');
    element.append(child);

    // Hover effect
    child = document.createElement('div');
    child.classList.add(...buttonChild2Classes);
    element.append(child);

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
        getChild().style.zIndex = -10000;
        getOtherChildren().forEach(c => c.style.zIndex = '');
        styleWatchOnChild();
        log('Delayed update due to change to children');
        updatePositionsDelayed();
    });

    classWatcher = new ClassWatcher(parentView,
        (_, afterOnly) => {
            for (const cls of afterOnly) {
                const viewMode = getViewModeFromClass(cls);
                if (viewMode && currentViewMode !== viewMode) {
                    currentViewMode = viewMode;
                    onViewChanged();
                }
            }
        }
    );
}

const updatePositionsDelayed = debounce(updatePositionsImmediate, 510);

const onResize = () => {
    log('Delayed update due to resize');
    updatePositionsDelayed();
}

function activate() {
    log('Activate');
    initializeParent();
    styleWatchOnParent();
    addButton();
    window.addEventListener('resize', onResize);
}

function deactivate() {
    log('Deactivate');

    parentView = undefined;
    currentViewMode = undefined;

    // Deactivate style watchers
    styleWatchOnChild();
    styleWatchOnParent();

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

    window.removeEventListener('resize', onResize);
}

const root = document.querySelector('[jsname=RFn3Rd]');
if (!root) {
    log('Root element not found.');
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
