import { expect, test } from "@playwright/test"

test("lists each installable component individually in the sidebar", async ({ page, request }) => {
  const manifest = await (await request.get("/r/registry.json")).json() as { items: { name: string; type: string }[] }
  const expected = manifest.items.filter(({ type }) => type === "registry:ui" || type === "registry:lib").map(({ name }) => name).sort()

  await page.goto("/")
  const group = page.getByRole("navigation", { name: "Main navigation" }).getByRole("group", { name: "Components", exact: true })
  await expect(group).toBeVisible()
  const linked = await group.getByRole("link").evaluateAll((links) => links.map((link) => link.getAttribute("href")!.split("/").at(-1)).sort())
  expect(linked).toEqual(expected)
  await group.getByRole("link", { name: "Avatar", exact: true }).click()
  const main = page.getByRole("main")
  await expect(main.getByRole("heading", { name: "Avatar", exact: true })).toBeVisible()
  await expect(main.getByRole("img", { name: "Maya Chen" })).toHaveText("MC")
  await expect(main.locator("code")).toContainText('npx shadcn@latest add "http://127.0.0.1:4173/r/avatar.json"')
  await expect(group.getByRole("link", { name: "Avatar", exact: true })).toHaveAttribute("aria-current", "page")
})

test("accordion and slider previews work from the keyboard", async ({ page }) => {
  await page.goto("/#/components/accordion")
  const item = page.getByRole("button", { name: "Who owns the rollout?" })
  await item.focus()
  await page.keyboard.press("Enter")
  await expect(item).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByText("The field operations team.")).toBeVisible()

  await page.goto("/#/components/slider")
  const slider = page.getByRole("slider", { name: "Alert threshold" })
  await slider.focus()
  await page.keyboard.press("ArrowRight")
  await expect(slider).toHaveAttribute("aria-valuenow", "70")
})

test("complete sidebars support workspace switching and compact navigation", async ({ page }) => {
  await page.goto("/#/preview/sidebar-workspace")
  await page.getByRole("button", { name: "North operations" }).click()
  await page.getByRole("menuitem", { name: "Field services" }).click()
  await expect(page.getByRole("main").getByText("Field services")).toBeVisible()
  await page.getByRole("link", { name: "Projects", exact: true }).click()
  await expect(page.getByRole("cell", { name: "Crew onboarding" })).toBeVisible()
  await page.getByRole("button", { name: "Maya Chen Operations lead" }).click()
  await page.getByRole("menuitem", { name: "Workspace preferences" }).click()
  await expect(page.getByRole("switch", { name: "Project updates" })).toBeChecked()

  await page.goto("/#/preview/sidebar-projects")
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible()
  await page.getByRole("link", { name: "Work queue" }).click()
  await expect(page.getByRole("heading", { name: "Work queue" })).toBeVisible()
})

test("project sidebar drawer closes when a mobile user selects a destination", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/#/preview/sidebar-projects")
  await page.getByRole("button", { name: "Open navigation" }).click()
  const drawer = page.getByRole("dialog", { name: "Navigation" })
  await drawer.getByRole("link", { name: "Work queue" }).click()
  await expect(drawer).toBeHidden()
  await expect(page.getByRole("heading", { name: "Work queue" })).toBeVisible()
  expect(await page.getByRole("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
})

test("one dialog covers the default, alert and sheet variants", async ({ page }) => {
  await page.goto("/#/components/dialog")
  await page.getByRole("button", { name: "View project summary" }).click()
  const dialog = page.getByRole("dialog", { name: "Project summary" })
  await expect(dialog.getByRole("button", { name: "Close" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()

  await page.getByRole("radio", { name: "alert" }).or(page.getByRole("button", { name: "alert", exact: true })).click()
  await page.getByRole("button", { name: "Remove project" }).click()
  const alert = page.getByRole("alertdialog", { name: "Remove project?" })
  await expect(alert).toBeVisible()
  await expect(alert.getByRole("button", { name: "Close" })).toHaveCount(0)
  await alert.getByRole("button", { name: "Remove project" }).click()
  await expect(alert).toBeHidden()
  await expect(page.getByRole("status").filter({ hasText: "Project removed." })).toBeVisible()

  await page.getByRole("radio", { name: "sheet" }).or(page.getByRole("button", { name: "sheet", exact: true })).click()
  await page.getByRole("button", { name: "Edit project details" }).click()
  await expect(page.getByRole("dialog", { name: "Project details" }).getByLabel("Project name")).toHaveValue("North Campus rollout")
})

test("command palette opens from the keyboard and runs a fuzzy match", async ({ page }) => {
  await page.goto("/#/components/command")
  await expect(page.getByRole("heading", { name: "Command", exact: true })).toBeVisible()
  await page.keyboard.press("ControlOrMeta+k")
  const palette = page.getByRole("dialog", { name: "Command palette" })
  await expect(palette).toBeVisible()
  await palette.getByRole("combobox").fill("remove")
  await expect(palette.getByRole("option", { name: "Archive project" })).toHaveAttribute("aria-selected", "true")
  await page.keyboard.press("Enter")
  await expect(palette).toBeHidden()
  await expect(page.getByRole("status").filter({ hasText: "Project archived." })).toBeVisible()
})

test("menu offers the same items as a dropdown and a context menu", async ({ page }) => {
  await page.goto("/#/components/dropdown-menu")
  await page.getByRole("button", { name: "Project actions" }).click()
  await page.getByRole("menuitemcheckbox", { name: "Show archived" }).click()
  await expect(page.getByRole("menuitemcheckbox", { name: "Show archived" })).toHaveAttribute("aria-checked", "true")
  await page.keyboard.press("Escape")

  await page.getByRole("radio", { name: "context" }).or(page.getByRole("button", { name: "context", exact: true })).click()
  await page.getByText("Right-click or long-press here").click({ button: "right" })
  await page.getByRole("menuitem", { name: "Duplicate" }).click()
  await expect(page.getByRole("status").filter({ hasText: "Project duplicated." })).toBeVisible()
})
