import { Plugin, TFile, WorkspaceLeaf } from "obsidian";

/**
When a new note is created in the vault, the most recent leaf is detached from the workspace if it is not pinned.


Here is a brief overview of the things that happen when a new note is created:
1. New file f is created (Obsidian)
2. Temporarily store current leaf x (Extension)
3. Create new leaf y and open file f inside it (Obsidian)
4. Set new leaf to active (Obsidian)
5. Detach previous leaf x (Extension)

Because `getMostRecentLeaf()` gets updated between the `app.vault create` and `app.workspace file-open` event to the new active leaf, the previous leaf has to be stored inside the `lastOpened` variable.

Calling `detach()` inside the `create` event handler causes issues with split views in Obsidian. If the previous tab is detached before the new tab is created (file-open), the split-view will close if there is only one tab left (and the new tab will be created in the preceding (split-)view).
 */
export default class NoTabsPlugin extends Plugin {
	lastOpened: WorkspaceLeaf | null = null;

	async onload() {
		this.registerEvent(
			this.app.vault.on("create", () => {
				this.lastOpened = this.app.workspace.getMostRecentLeaf();
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-open", (file: TFile) => {
				const timeSinceCreation = Date.now() - file.stat.ctime;
				const leaf = this.app.workspace.getMostRecentLeaf();
				if (
					this.lastOpened &&
					this.lastOpened !== leaf &&
					!this.lastOpened.getViewState().pinned &&
					timeSinceCreation < 1000
				) {
					this.lastOpened.detach();
				}
			})
		);
	}
}
