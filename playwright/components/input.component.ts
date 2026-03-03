import { Locator } from "@playwright/test";

export class FieldComponent {
  constructor(private readonly root: Locator) {}

  get input(): Locator {
    return this.root.locator("input");
  }
}
