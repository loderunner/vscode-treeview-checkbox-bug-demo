import * as vscode from "vscode";

const treeState = [
  {
    label: "Workflow 1",
    selected: true,
    jobs: [
      { label: "Job 1", selected: true },
      { label: "Job 2", selected: true },
      { label: "Job 3", selected: true },
    ],
  },
  {
    label: "Workflow 2",
    selected: true,
    jobs: [
      { label: "Job 1", selected: false },
      { label: "Job 2", selected: false },
    ],
  },
];

export function activate(context: vscode.ExtensionContext) {
  const onDidChangeTreeData = new vscode.EventEmitter<void | string>();
  const treeDataProvider: vscode.TreeDataProvider<string> = {
    onDidChangeTreeData: onDidChangeTreeData.event,
    getChildren(element?: string): vscode.ProviderResult<string[]> {
      if (!element) {
        return treeState.map((w) => w.label);
      }
      const children: string[] = [];
      for (const w of treeState) {
        if (w.label !== element) {
          continue;
        }
        for (const j of w.jobs) {
          children.push(`${w.label}/${j.label}`);
        }
      }
      return children;
    },
    getTreeItem(element: string) {
      if (element.includes("/")) {
        const [workflowElement, jobElement] = element.split("/");
        const state = treeState
          .find((w) => w.label === workflowElement)!
          .jobs.find((j) => j.label === jobElement);
        const item = new vscode.TreeItem(element);
        item.checkboxState = state!.selected
          ? vscode.TreeItemCheckboxState.Checked
          : vscode.TreeItemCheckboxState.Unchecked;
        return item;
      }

      const state = treeState.find((w) => w.label === element);
      const item = new vscode.TreeItem(
        element,
        vscode.TreeItemCollapsibleState.Collapsed
      );
      item.checkboxState = state!.selected
        ? vscode.TreeItemCheckboxState.Checked
        : vscode.TreeItemCheckboxState.Unchecked;
      return item;
    },
  };

  const treeView = vscode.window.createTreeView("tree-view-bug", {
    treeDataProvider,
    manageCheckboxStateManually: true,
  });

  treeView.onDidChangeCheckboxState((e) => {
    for (const [element, checked] of e.items) {
      console.log(
        `onDidChangeCheckboxState: ${element} ${
          checked === vscode.TreeItemCheckboxState.Checked
            ? "checked"
            : "unchecked"
        }`
      );
      let state: any;
      if (element.includes("/")) {
        const [workflowElement, jobElement] = element.split("/");
        state = treeState
          .find((w) => w.label === workflowElement)!
          .jobs.find((j) => j.label === jobElement);
        state!.selected = checked === vscode.TreeItemCheckboxState.Checked;
      } else {
        state = treeState.find((w) => w.label === element);
      }
      state!.selected = checked === vscode.TreeItemCheckboxState.Checked;
      onDidChangeTreeData.fire(element);
    }
  });

  context.subscriptions.push(treeView);
}

export function deactivate() {}
