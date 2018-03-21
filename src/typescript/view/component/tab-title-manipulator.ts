import { DetectedBrowser } from '../../browser/detected-browser';
import { TabMatcher } from '../../tab/tab-matcher';

export type TabTitleClickCallback = (clickedElement: HTMLAnchorElement) => void;

export class TabTitleManipulator {
    constructor(private detectedBrowser: DetectedBrowser, private tabMatcher: TabMatcher, private defaultFaviconUrl: string) {
    }

    create(clickCallback: TabTitleClickCallback) {
        const linkElement = document.createElement('a');
        linkElement.classList.add('title');
        linkElement.innerHTML = `
            <img />
            <span></span>
            <em></em>
        `;

        if (clickCallback) {
            linkElement.addEventListener('click', () => clickCallback(linkElement));
        }

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
        const titleTextElement = row.querySelector('.title span');
        titleTextElement.textContent = title;
        titleTextElement.setAttribute('data-filter-matchable-text', title);
    }

    updateTitleTooltip(row: HTMLElement, tooltipText: string) {
        const titleElement = row.querySelector('.title');
        titleElement.setAttribute('data-tooltip', tooltipText);
        jQuery(titleElement).tooltip();
    }

    updateUrl(row: HTMLElement, url: string) {
        row.querySelector('.title').setAttribute('data-url', '' + url);

        const urlElement = row.querySelector('.title em');
        urlElement.textContent = url;

        const matchableUrl = this.tabMatcher.getMatchableUrl(url);
        urlElement.setAttribute('data-filter-matchable-text', matchableUrl);
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
