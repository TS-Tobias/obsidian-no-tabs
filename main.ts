import { Plugin, WorkspaceLeaf } from "obsidian";
import SettingsTab from "settings";

interface Data {
	settings: Settings;
}

interface Settings {
	strictMode: boolean;
}

const DEFAULT_SETTINGS: Settings = {
	strictMode: false,
};

const DEFAULT_DATA: Partial<Data> = {
	settings: DEFAULT_SETTINGS,
};

export default class NoTabsPlugin extends Plugin {
	data: Data;
	activeTab: WorkspaceLeaf | null = null;
	newFile = false;

	async onload() {
		await this.loadData();

		this.registerEvent(
			this.app.vault.on("create", () => {
				if (this.data.settings.strictMode) return;

				this.activeTab = this.app.workspace.getMostRecentLeaf();
				if (!this.activeTab) return;
				const { pinned, type } = this.activeTab.getViewState();

				if (pinned) return;
				if (type === "empty") return;

				this.newFile = true;
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-open", () => {
				if (this.data.settings.strictMode) return;
				if (!this.newFile) return;
				this.newFile = false;
				this.activeTab?.detach();
				this.activeTab = this.app.workspace.getMostRecentLeaf();
			})
		);

		this.registerEvent(
			this.app.workspace.on(
				"active-leaf-change",
				(activeLeaf: WorkspaceLeaf) => {
					if (!this.data.settings.strictMode) return;
					if (activeLeaf.getViewState().pinned) return;
					const { type } = activeLeaf.getViewState();
					if (type === "empty" || type === "markdown") {
						// @ts-ignore
						activeLeaf.parent.children.forEach(
							(leaf: WorkspaceLeaf) => {
								if (
									// @ts-ignore
									leaf.id !== activeLeaf.id &&
									!leaf.getViewState().pinned
								) {
									leaf.detach();
								}
							}
						);
					}
				}
			)
		);

		this.addSettingTab(new SettingsTab(this.app, this));
	}

	async saveData(): Promise<void> {
		await super.saveData(this.data);
	}

	async loadData(): Promise<void> {
		this.data = Object.assign({}, DEFAULT_DATA, await super.loadData());
	}
}
