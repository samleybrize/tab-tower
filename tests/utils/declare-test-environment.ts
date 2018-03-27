interface TestConfiguration {
    maximumNumberOfRecentlyUnfollowedTabs: number;
}

interface Window {
    testConfiguration: TestConfiguration;
}

window.isTestEnvironment = true;
window.testConfiguration = {
    maximumNumberOfRecentlyUnfollowedTabs: 5,
};
