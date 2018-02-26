import { DetectedBrowser } from '../../browser/detected-browser';

export type TabTitleClickCallback = (clickedElement: HTMLAnchorElement) => void;

export class TabTitleManipulator {
    constructor(private detectedBrowser: DetectedBrowser, private defaultFaviconUrl: string) {
    }

    create(clickCallback: TabTitleClickCallback) {
        const linkElement = document.createElement('a');
        linkElement.classList.add('title');
        linkElement.innerHTML = `
            <img />
            <span class="filterMatchable"></span>
            <em class="filterMatchable"></em>
        `;
        linkElement.addEventListener('click', () => clickCallback(linkElement));

        const imgElement = linkElement.querySelector('img');
        imgElement.addEventListener('error', (event) => {
            (event.target as HTMLImageElement).src = this.defaultFaviconUrl;
        });

        if ('firefox' == this.detectedBrowser.name && this.detectedBrowser.majorVersion < 59) {
            // prior to firefox 59, images on a host that requires authentication causes the http auth popup to open
            imgElement.setAttribute('crossorigin', 'anonymous');
        }

        return linkElement;
    }

    updateTitle(row: HTMLElement, title: string) {
        row.querySelector('.title span').textContent = title;
    }

    updateTitleTooltip(row: HTMLElement, tooltipText: string) {
        const titleElement = row.querySelector('.title');
        titleElement.setAttribute('data-tooltip', tooltipText);
        jQuery(titleElement).tooltip();
    }

    updateUrl(row: HTMLElement, url: string) {
        row.querySelector('.title').setAttribute('data-url', '' + url);
        row.querySelector('.title em').textContent = url;
    }

    updateFavicon(row: HTMLElement, faviconUrl: string) {
        const faviconElement = row.querySelector('.title img') as HTMLImageElement;

        if (null == faviconUrl) {
            faviconElement.src = this.defaultFaviconUrl;
        } else {
            faviconElement.src = faviconUrl;
        }
    }
}
