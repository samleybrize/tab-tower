document.querySelector('.current-workspace').addEventListener('click', () => {
    document.querySelector('.workspace-list').classList.add('show');
    document.querySelector('.workspace-list-overlay').classList.add('show');
});

document.querySelector('.workspace-list-overlay').addEventListener('click', () => {
    document.querySelector('.workspace-list').classList.remove('show');
    document.querySelector('.workspace-list-overlay').classList.remove('show');
});

// tabs
let tabList = [
    {
        title: 'Tab title azerty azerty azerty',
        url: 'http://toto.com/a/z/e',
        domain: 'toto.com',
        faviconUrl: 'https://cdn.css-tricks.com/apple-touch-icon.png',
        isActive: false,
        isAudible: false,
        isDiscarded: false,
        isLoading: true,
        isMuted: false,
        isPinned: false,
        isHighlighted: false,
    },
    {
        title: 'Tab title azerty azerty azerty',
        url: 'http://toto.com/a/z/e',
        domain: 'toto.com',
        faviconUrl: '/icons/tab-tower.svg',
        isActive: false,
        isAudible: false,
        isDiscarded: false,
        isLoading: false,
        isMuted: false,
        isPinned: false,
        isHighlighted: true,
    },
    {
        title: 'Tab title',
        url: 'http://toto.com/a/z/e',
        domain: 'az.er.hahaha.com',
        faviconUrl: 'https://www.mozilla.org/media/img/favicon/favicon-196x196.c80e6abe0767.png',
        isActive: false,
        isAudible: false,
        isDiscarded: true,
        isLoading: false,
        isMuted: false,
        isPinned: false,
        isHighlighted: false,
    },
    {
        title: 'Tab title azerty azerty azerty azerty',
        url: 'http://toto.com/a/z/e',
        domain: 'az.er.hahaha.com',
        faviconUrl: 'https://www.mozilla.org/media/img/favicon/favicon-196x196.c80e6abe0767.png',
        isActive: false,
        isAudible: true,
        isDiscarded: false,
        isLoading: false,
        isMuted: false,
        isPinned: false,
        isHighlighted: false,
    },
    {
        title: 'Tab title azerty azerty azerty azerty',
        url: 'http://toto.com/a/z/e',
        domain: 'az.er.hahaha.com',
        faviconUrl: 'https://www.mozilla.org/media/img/favicon/favicon-196x196.c80e6abe0767.png',
        isActive: false,
        isAudible: false,
        isDiscarded: false,
        isLoading: false,
        isMuted: true,
        isPinned: false,
        isHighlighted: false,
    },
    {
        title: 'TabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazertyTabtitleazertyazertyazerty',
        url: 'http://toto.com/a/z/e',
        domain: 'toto.com',
        faviconUrl: 'https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/wp-content/themes/Hax/favicon.ico',
        isActive: true,
        isAudible: false,
        isDiscarded: false,
        isLoading: false,
        isMuted: false,
        isPinned: false,
        isHighlighted: false,
    },

    // pinned tabs
    {
        // title: 'Pinned tab title azerty azerty azerty',
        title: 'Material icons - Material design azerty',
        url: 'http://toto.com/a/z/e',
        domain: 'toto.com',
        faviconUrl: '/icons/tab-tower.svg',
        isActive: false,
        isAudible: false,
        isDiscarded: false,
        isLoading: false,
        isMuted: false,
        isPinned: true,
        isHighlighted: false,
    },
];

const pinnedTab = tabList[tabList.length - 1];
tabList.push(Object.assign({}, pinnedTab));
tabList.push(Object.assign({}, pinnedTab));
tabList.push(Object.assign({}, pinnedTab));
tabList.push(Object.assign({}, pinnedTab));
tabList.push(Object.assign({}, pinnedTab));
tabList[tabList.length - 2].isAudible = true;
tabList[tabList.length - 1].isMuted = true;

function createTab(tab) {
    const id = Math.random();
    const tabElement = document.createElement('div');
    tabElement.classList.add('tab');
    tabElement.innerHTML = `
        <span class="favicon">
            <img src="${tab.faviconUrl}" alt="" />
            <span class="tab-selector">
                <input type="checkbox" id="${id}" title="Select tab" />
                <span class="checkbox-icon">
                    <label class="material-icons checked" for="${id}">check_box</label>
                    <label class="material-icons unchecked" for="${id}">check_box_outline_blank</label>
                </span>
            </span>
        </span>
        <span class="title-container">
            <span class="title">${tab.title}</span>
            <span class="url">${tab.url}</span>
            <span class="domain">${tab.domain}</span>
        </span>
        <span class="audible-icon"><i class="material-icons" title="Mute tab">volume_up</i></span>
        <span class="muted-icon"><i class="material-icons" title="Unmute tab">volume_off</i></span>
        <span class="close-button"><i class="material-icons" title="Close tab">close</i></span>
        <span class="pin-icon"><img alt="" src="/ui/images/pin.svg" /></span>
        <span class="move-above-button" title="Move above"><i class="material-icons">keyboard_arrow_up</i></span>
    `;

    if (tab.isActive) {
        tabElement.classList.add('active');
    } else if (tab.isHighlighted) {
        tabElement.classList.add('highlighted');
    }

    if (tab.isAudible) {
        tabElement.classList.add('audible');
    }

    if (tab.isMuted) {
        tabElement.classList.add('muted');
    }

    if (tab.isLoading) {
        tabElement.classList.add('loading');
    }

    if (tab.isDiscarded) {
        tabElement.classList.add('discarded');
    }

    // selector
    const faviconElement = tabElement.querySelector('.favicon img');
    faviconElement.addEventListener('error', () => {
        faviconElement.src = '/ui/images/default-favicon.svg';
    });

    // selector
    const tabSelector = tabElement.querySelector('.tab-selector input');

    if (tabSelector.checked) {
        tabElement.classList.add('selected');
    }

    tabSelector.addEventListener('change', () => {
        if (tabSelector.checked) {
            tabElement.classList.add('selected');
        } else {
            tabElement.classList.remove('selected');
        }
    });

    return tabElement;
}

function fromTabArray(tabList) {
    for (const tab of tabList) {
        const tabElement = createTab(tab);

        if (tab.isPinned) {
            document.querySelector('.tab-list .pinned-tabs').insertAdjacentElement('beforeend', tabElement);
        } else {
            document.querySelector('.tab-list .unpinned-tabs').insertAdjacentElement('beforeend', tabElement);
        }
    }
}

function fromRealTabs() {
    tabList = [];

    browser.tabs.query({}).then((nativeTabList) => {
        for (const nativeTab of nativeTabList) {
            const urlObject = new URL(nativeTab.url);
            tabList.push({
                title: nativeTab.title,
                url: nativeTab.url,
                domain: urlObject.hostname,
                faviconUrl: nativeTab.favIconUrl,
                isActive: nativeTab.active,
                isAudible: nativeTab.audible,
                isDiscarded: nativeTab.discarded,
                isLoading: 'loading' == nativeTab.status,
                isMuted: nativeTab.mutedInfo ? !!nativeTab.mutedInfo.muted : false,
                isPinned: nativeTab.pinned,
                isHighlighted: nativeTab.highlighted,
            });
        }

        fromTabArray(tabList);
    });
}

fromTabArray(tabList);
// fromRealTabs();
