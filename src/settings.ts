import { App, PluginSettingTab, Setting } from "obsidian";
import NoTabsPlugin from "./main";

export default class SettingsTab extends PluginSettingTab {
	private readonly plugin: NoTabsPlugin;

	constructor(app: App, plugin: NoTabsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "NoTabs Settings" });
		new Setting(containerEl)
			.setName("Strict Mode")
			.setDesc(
				"Warning: Strict Mode will close all tabs that are not active or  pinned"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.data.settings.strictMode)
					.onChange(async (value: boolean) => {
						this.plugin.data.settings.strictMode = value;
						await this.plugin.saveData();
					})
			);
	}
}
