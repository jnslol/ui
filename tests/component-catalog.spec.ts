import { expect, test } from "@playwright/test"

test("lists each installable component individually in the sidebar", async ({ page, request }) => {
  const manifest = await (await request.get("/r/registry.json")).json() as { items: { name: string; type: string }[] }
  const expected = manifest.items.filter(({ type }) => type === "registry:ui").map(({ name }) => name).sort()

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
