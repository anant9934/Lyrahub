import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { DEFAULT_CAPABILITIES, getLiveCapabilities } from "@/responsive/deviceCapabilities"
import { ResponsiveContainer } from "@/components/responsive/ResponsiveContainer"
import { ResponsiveGrid } from "@/components/responsive/ResponsiveGrid"
import { ResponsiveTable } from "@/components/responsive/ResponsiveTable"
import { ResponsiveModal } from "@/components/responsive/ResponsiveModal"
import { ResponsiveBottomNav } from "@/components/responsive/ResponsiveBottomNav"
import { ResponsiveSidebar } from "@/components/responsive/ResponsiveSidebar"
import { LayoutDashboard, Award, FolderGit2, Sparkles, User } from "lucide-react"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock auth context for components using useAuth (e.g. ResponsiveSidebar)
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    user: { email: "test@aiml.hub", role: "student" },
    logout: vi.fn(),
    login: vi.fn(),
  }),
}))

describe("AIMETRA Responsive Architecture & Capabilities", () => {
  it("provides SSR-safe default capabilities without throwing", () => {
    expect(DEFAULT_CAPABILITIES.viewportWidth).toBe(1280)
    expect(DEFAULT_CAPABILITIES.viewportHeight).toBe(800)
    expect(DEFAULT_CAPABILITIES.orientation).toBe("landscape")
    expect(DEFAULT_CAPABILITIES.touchSupport).toBe(false)
    expect(DEFAULT_CAPABILITIES.prefersReducedMotion).toBe(false)
    expect(DEFAULT_CAPABILITIES.online).toBe(true)
    expect(DEFAULT_CAPABILITIES.isMounted).toBe(false)
  })

  it("detects client capabilities safely when window is available", () => {
    const clientCaps = getLiveCapabilities()
    expect(typeof clientCaps.viewportWidth).toBe("number")
    expect(typeof clientCaps.viewportHeight).toBe("number")
    expect(["portrait", "landscape"]).toContain(clientCaps.orientation)
  })
})

describe("Responsive Primitives Across Viewport Matrix", () => {
  const VIEWPORT_MATRIX = [
    { name: "320px Phone (iPhone SE)", width: 320, height: 568 },
    { name: "375px Phone (iPhone 8)", width: 375, height: 667 },
    { name: "390px Phone (iPhone 13/14)", width: 390, height: 844 },
    { name: "430px Phone (iPhone 14 Pro Max)", width: 430, height: 932 },
    { name: "768px Tablet (iPad Mini)", width: 768, height: 1024 },
    { name: "1024px Tablet/Laptop", width: 1024, height: 768 },
    { name: "1280px Desktop", width: 1280, height: 800 },
    { name: "1440px Large Desktop", width: 1440, height: 900 },
    { name: "1920px Ultrawide/FHD", width: 1920, height: 1080 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  VIEWPORT_MATRIX.forEach(({ name, width, height }) => {
    it(`renders ResponsiveContainer correctly at ${name} (${width}x${height})`, () => {
      window.innerWidth = width
      window.innerHeight = height

      const { container } = render(
        <ResponsiveContainer size="default">
          <div data-testid="content">Responsive Content</div>
        </ResponsiveContainer>
      )

      expect(screen.getByTestId("content")).toBeInTheDocument()
      const element = container.firstChild as HTMLElement
      expect(element).toHaveClass("w-full")
      expect(element).toHaveClass("mx-auto")
    })
  })

  it("ResponsiveGrid renders responsive minmax columns without overflow", () => {
    const { container } = render(
      <ResponsiveGrid minItemWidth={280} gap="md">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </ResponsiveGrid>
    )

    const grid = container.firstChild as HTMLElement
    expect(grid).toHaveClass("grid")
    expect(grid.style.gridTemplateColumns).toContain("minmax(min(100%, 280px), 1fr)")
  })

  it("ResponsiveTable renders controlled horizontal scroll cues", () => {
    const { container } = render(
      <ResponsiveTable>
        <table>
          <thead>
            <tr>
              <th>Column 1</th>
              <th>Column 2</th>
              <th>Column 3</th>
              <th>Column 4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data 1</td>
              <td>Data 2</td>
              <td>Data 3</td>
              <td>Data 4</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    )

    const scrollContainer = container.querySelector(".overflow-x-auto")
    expect(scrollContainer).toBeInTheDocument()
    expect(screen.getByText("Column 1")).toBeInTheDocument()
  })

  it("ResponsiveModal renders as adaptive dialog and handles Escape key", () => {
    const handleClose = vi.fn()
    render(
      <ResponsiveModal
        isOpen={true}
        onClose={handleClose}
        title="Test Modal"
        description="Testing accessibility and responsiveness"
      >
        <p>Modal Body Content</p>
      </ResponsiveModal>
    )

    expect(screen.getByText("Test Modal")).toBeInTheDocument()
    expect(screen.getByText("Modal Body Content")).toBeInTheDocument()

    // Test Escape key dismissal
    fireEvent.keyDown(window, { key: "Escape" })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("ResponsiveBottomNav renders one-handed mobile navigation targets", () => {
    render(
      <ResponsiveBottomNav
        onOpenAIDA={vi.fn()}
      />
    )

    // Check presence of touch targets
    expect(screen.getByLabelText("Dashboard")).toBeInTheDocument()
    expect(screen.getByLabelText("Rankings")).toBeInTheDocument()
    expect(screen.getByLabelText("Ask AIDA assistant")).toBeInTheDocument()
    expect(screen.getByLabelText("Projects")).toBeInTheDocument()
    expect(screen.getByLabelText("Profile")).toBeInTheDocument()
  })

  it("ResponsiveSidebar supports collapsed rail mode and persistent full mode", () => {
    const items = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Rankings", href: "/ranking", icon: Award },
      { label: "Projects", href: "/projects", icon: FolderGit2 },
      { label: "AIDA", href: "/aida", icon: Sparkles },
      { label: "Profile", href: "/profile", icon: User },
    ]

    // Collapsed rail mode
    const { rerender } = render(
      <ResponsiveSidebar
        items={items}
        collapsed={true}
        onToggleCollapse={vi.fn()}
      />
    )

    // Expand to full mode
    rerender(
      <ResponsiveSidebar
        items={items}
        collapsed={false}
        onToggleCollapse={vi.fn()}
      />
    )

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Rankings")).toBeInTheDocument()
  })
})
