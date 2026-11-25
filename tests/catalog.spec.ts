import { expect, test } from "@playwright/test"

test("serves installable registry items at their documented URLs", async ({ request }) => {
  const manifest = await request.get("/r/registry.json")
  expect(manifest.ok()).toBe(true)
  const { items } = await manifest.json() as { items: { name: string; type: string }[] }
  expect(items.map((item) => item.name)).toEqual(expect.arrayContaining([
    "theme", "avatar", "accordion", "sidebar", "sidebar-workspace", "sidebar-projects", "activity-feed",
    "list-page", "record-page", "form-page", "settings-page", "workspace-page",
  ]))
  for (const { name, type } of items) {
    expect(name).not.toMatch(/^jns-/)
    const response = await request.get(`/r/${name}.json`)
    expect(response.ok()).toBe(true)
    const item = await response.json()
    expect(item.name).toBe(name)
    // Utilities (hooks) carry no styles; everything visual brings the tokens.
    if (type === "registry:lib") continue
    expect(item.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ target: "@ui/tokens.css", content: expect.stringContaining("@theme inline") }),
    ]))
  }
})

test("filters projects, edits a record and applies dark mode", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await page.getByRole("button", { name: "Collapse sidebar" }).click()
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible()
  const nav = page.getByRole("navigation", { name: "Main navigation" })
  await nav.getByRole("link", { name: "List", exact: true }).click()
  await page.getByRole("searchbox", { name: "Search projects" }).fill("North")
  await expect(page.getByRole("row")).toHaveCount(2)
  await page.getByRole("link", { name: "North Campus rollout" }).click()
  await page.getByRole("link", { name: "Edit project" }).click()
  await page.getByLabel("Project name").fill("North Campus extension")
  await page.getByRole("button", { name: "Save project" }).click()
  await expect(page.getByRole("heading", { name: "North Campus extension" })).toBeVisible()

  await nav.getByRole("link", { name: "Settings" }).click()
  await page.getByRole("combobox", { name: "Theme" }).click()
  await page.getByRole("option", { name: "Dark" }).click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  await page.reload()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  expect(errors).toEqual([])
})

test("mobile navigation supports Escape and closes on navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto("/")
  const trigger = page.getByRole("button", { name: "Open navigation" })
  await trigger.click()
  const menu = page.getByRole("dialog", { name: "Navigation" })
  await expect(menu).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await menu.getByRole("link", { name: "Workspace" }).click()
  await expect(menu).toBeHidden()
  await expect(page.getByRole("heading", { name: "Workspace" })).toBeVisible()
  expect(await page.getByRole("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
})
