import {
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Modal,
  EmptyState,
  Spinner,
  Pagination,
  StatusIndicator,
  StatusBadge,
  Tabs,
} from "../../components/ui";
import { Stack, Grid, Container, Separator, PageHeader } from "../../components/layout";
import { useState } from "react";
import styles from "./DesignSystemPage.module.css";

const COLOR_SWATCHES = [
  { name: "Primary 50",  color: "var(--color-primary-50)" },
  { name: "Primary 100", color: "var(--color-primary-100)" },
  { name: "Primary 200", color: "var(--color-primary-200)" },
  { name: "Primary 300", color: "var(--color-primary-300)" },
  { name: "Primary 400", color: "var(--color-primary-400)" },
  { name: "Primary 500", color: "var(--color-primary-500)" },
  { name: "Primary 600", color: "var(--color-primary-600)" },
  { name: "Primary 700", color: "var(--color-primary-700)" },
  { name: "Primary 800", color: "var(--color-primary-800)" },
  { name: "Primary 900", color: "var(--color-primary-900)" },
];

const GRAY_SWATCHES = [
  { name: "Gray 25",  color: "var(--color-gray-25)" },
  { name: "Gray 50",  color: "var(--color-gray-50)" },
  { name: "Gray 100", color: "var(--color-gray-100)" },
  { name: "Gray 200", color: "var(--color-gray-200)" },
  { name: "Gray 300", color: "var(--color-gray-300)" },
  { name: "Gray 400", color: "var(--color-gray-400)" },
  { name: "Gray 500", color: "var(--color-gray-500)" },
  { name: "Gray 600", color: "var(--color-gray-600)" },
  { name: "Gray 700", color: "var(--color-gray-700)" },
  { name: "Gray 800", color: "var(--color-gray-800)" },
  { name: "Gray 900", color: "var(--color-gray-900)" },
];

const SEMANTIC_COLORS = [
  { name: "Success", bg: "var(--color-success-50)", fg: "var(--color-success-700)", border: "var(--color-success-500)" },
  { name: "Warning", bg: "var(--color-warning-50)", fg: "var(--color-warning-700)", border: "var(--color-warning-500)" },
  { name: "Error",   bg: "var(--color-error-50)",   fg: "var(--color-error-700)",   border: "var(--color-error-500)" },
  { name: "Info",    bg: "var(--color-info-50)",    fg: "var(--color-info-700)",    border: "var(--color-info-500)" },
];

const TYPOGRAPHY_SCALE = [
  { name: "text-xs",   size: "0.75rem",  weight: "400", sample: "The quick brown fox" },
  { name: "text-sm",   size: "0.8125rem", weight: "400", sample: "The quick brown fox" },
  { name: "text-base", size: "0.875rem", weight: "400", sample: "The quick brown fox" },
  { name: "text-md",   size: "1rem",     weight: "400", sample: "The quick brown fox" },
  { name: "text-lg",   size: "1.125rem", weight: "400", sample: "The quick brown fox" },
  { name: "text-xl",   size: "1.25rem",  weight: "500", sample: "The quick brown fox" },
  { name: "text-2xl",  size: "1.5rem",   weight: "600", sample: "The quick brown fox" },
  { name: "text-3xl",  size: "1.875rem", weight: "600", sample: "The quick brown fox" },
  { name: "text-4xl",  size: "2.25rem",  weight: "700", sample: "The quick brown fox" },
];

const SPACING_SCALE = [
  { name: "space-1",  value: "4px" },
  { name: "space-2",  value: "8px" },
  { name: "space-3",  value: "12px" },
  { name: "space-4",  value: "16px" },
  { name: "space-5",  value: "20px" },
  { name: "space-6",  value: "24px" },
  { name: "space-8",  value: "32px" },
  { name: "space-10", value: "40px" },
  { name: "space-12", value: "48px" },
];

const RADIUS_SCALE = [
  { name: "xs",   value: "4px" },
  { name: "sm",   value: "6px" },
  { name: "md",   value: "8px" },
  { name: "lg",   value: "10px" },
  { name: "xl",   value: "12px" },
  { name: "2xl",  value: "16px" },
  { name: "3xl",  value: "20px" },
  { name: "full", value: "9999px" },
];

export function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");

  const tabs = [
    { key: "colors", label: "Colors" },
    { key: "typography", label: "Typography" },
    { key: "spacing", label: "Spacing" },
    { key: "components", label: "Components" },
    { key: "layout", label: "Layout" },
  ];

  return (
    <Container size="xl">
      <PageHeader
        title="Design System"
        subtitle="Visual foundation and component showcase for ISIMG ClubHub"
      />

      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      <div className={styles.content}>
        {activeTab === "colors" && <ColorsSection />}
        {activeTab === "typography" && <TypographySection />}
        {activeTab === "spacing" && <SpacingSection />}
        {activeTab === "components" && (
          <ComponentsSection
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
          />
        )}
        {activeTab === "layout" && <LayoutSection />}
      </div>
    </Container>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Colors
   ═══════════════════════════════════════════════════════════════════════════ */

function ColorsSection() {
  return (
    <Stack gap="xl">
      {/* Primary */}
      <section>
        <h3 className={styles.sectionTitle}>Primary (Forest Green)</h3>
        <div className={styles.swatchGrid}>
          {COLOR_SWATCHES.map((s) => (
            <div key={s.name} className={styles.swatch}>
              <div className={styles.swatchColor} style={{ backgroundColor: s.color }} />
              <div className={styles.swatchLabel}>{s.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Gray */}
      <section>
        <h3 className={styles.sectionTitle}>Neutral Grays</h3>
        <div className={styles.swatchGrid}>
          {GRAY_SWATCHES.map((s) => (
            <div key={s.name} className={styles.swatch}>
              <div className={styles.swatchColor} style={{ backgroundColor: s.color }} />
              <div className={styles.swatchLabel}>{s.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Semantic */}
      <section>
        <h3 className={styles.sectionTitle}>Semantic Colors</h3>
        <div className={styles.semanticGrid}>
          {SEMANTIC_COLORS.map((s) => (
            <div key={s.name} className={styles.semanticCard}>
              <div
                className={styles.semanticPreview}
                style={{ backgroundColor: s.bg, borderColor: s.border }}
              >
                <span style={{ color: s.fg, fontWeight: 500 }}>{s.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Stack>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Typography
   ═══════════════════════════════════════════════════════════════════════════ */

function TypographySection() {
  return (
    <Stack gap="xl">
      <section>
        <h3 className={styles.sectionTitle}>Type Scale — Inter</h3>
        <div className={styles.typeScale}>
          {TYPOGRAPHY_SCALE.map((t) => (
            <div key={t.name} className={styles.typeRow}>
              <code className={styles.typeName}>{t.name}</code>
              <span className={styles.typeSize}>{t.size}</span>
              <span className={styles.typeSample} style={{ fontSize: t.size, fontWeight: Number(t.weight) }}>
                {t.sample}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className={styles.sectionTitle}>Font Weights</h3>
        <div className={styles.typeScale}>
          <div className={styles.typeRow}>
            <code className={styles.typeName}>regular</code>
            <span className={styles.typeSize}>400</span>
            <span className={styles.typeSample} style={{ fontWeight: 400 }}>The quick brown fox jumps over the lazy dog</span>
          </div>
          <div className={styles.typeRow}>
            <code className={styles.typeName}>medium</code>
            <span className={styles.typeSize}>500</span>
            <span className={styles.typeSample} style={{ fontWeight: 500 }}>The quick brown fox jumps over the lazy dog</span>
          </div>
          <div className={styles.typeRow}>
            <code className={styles.typeName}>semibold</code>
            <span className={styles.typeSize}>600</span>
            <span className={styles.typeSample} style={{ fontWeight: 600 }}>The quick brown fox jumps over the lazy dog</span>
          </div>
          <div className={styles.typeRow}>
            <code className={styles.typeName}>bold</code>
            <span className={styles.typeSize}>700</span>
            <span className={styles.typeSample} style={{ fontWeight: 700 }}>The quick brown fox jumps over the lazy dog</span>
          </div>
        </div>
      </section>
    </Stack>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Spacing
   ═══════════════════════════════════════════════════════════════════════════ */

function SpacingSection() {
  return (
    <Stack gap="xl">
      <section>
        <h3 className={styles.sectionTitle}>Spacing Scale (4px base)</h3>
        <div className={styles.spacingScale}>
          {SPACING_SCALE.map((s) => (
            <div key={s.name} className={styles.spacingRow}>
              <code className={styles.spacingName}>{s.name}</code>
              <span className={styles.spacingValue}>{s.value}</span>
              <div className={styles.spacingBar} style={{ width: s.value }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className={styles.sectionTitle}>Border Radius</h3>
        <div className={styles.radiusGrid}>
          {RADIUS_SCALE.map((r) => (
            <div key={r.name} className={styles.radiusItem}>
              <div className={styles.radiusBox} style={{ borderRadius: r.value }} />
              <code className={styles.radiusName}>{r.name}</code>
              <span className={styles.radiusValue}>{r.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className={styles.sectionTitle}>Shadows</h3>
        <div className={styles.shadowGrid}>
          {["xs", "sm", "md", "lg", "xl"].map((s) => (
            <div key={s} className={styles.shadowItem}>
              <div className={styles.shadowBox} style={{ boxShadow: `var(--shadow-${s})` }} />
              <code className={styles.shadowName}>{s}</code>
            </div>
          ))}
        </div>
      </section>
    </Stack>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Components
   ═══════════════════════════════════════════════════════════════════════════ */

function ComponentsSection({
  modalOpen,
  setModalOpen,
}: {
  modalOpen: boolean;
  setModalOpen: (v: boolean) => void;
}) {
  return (
    <Stack gap="xl">
      {/* Buttons */}
      <section>
        <h3 className={styles.sectionTitle}>Buttons</h3>
        <Stack gap="md">
          <Stack direction="horizontal" gap="sm" align="center">
            <Button variant="primary" size="xs">Extra Small</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </Stack>
          <Stack direction="horizontal" gap="sm" align="center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </Stack>
          <Stack direction="horizontal" gap="sm" align="center">
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
          </Stack>
        </Stack>
      </section>

      <Separator />

      {/* Inputs */}
      <section>
        <h3 className={styles.sectionTitle}>Inputs</h3>
        <Grid minItemWidth="280px" gap="md">
          <Input label="Default" placeholder="Enter text..." />
          <Input label="With Error" placeholder="Enter text..." error="This field is required" />
          <Input label="With Hint" placeholder="Enter text..." hint="Helpful text here" />
          <Select
            label="Select"
            options={[
              { value: "1", label: "Option 1" },
              { value: "2", label: "Option 2" },
              { value: "3", label: "Option 3" },
            ]}
            placeholder="Choose..."
          />
          <Textarea label="Textarea" placeholder="Write something..." />
        </Grid>
      </section>

      <Separator />

      {/* Badges */}
      <section>
        <h3 className={styles.sectionTitle}>Badges</h3>
        <Stack gap="md">
          <Stack direction="horizontal" gap="sm" align="center">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
          </Stack>
          <Stack direction="horizontal" gap="sm" align="center">
            <Badge variant="success" dot>With Dot</Badge>
            <Badge variant="primary" size="sm">Small</Badge>
          </Stack>
        </Stack>
      </section>

      <Separator />

      {/* Status Badge */}
      <section>
        <h3 className={styles.sectionTitle}>Status Badges</h3>
        <Stack direction="horizontal" gap="sm" align="center" wrap>
          <StatusBadge status="draft" />
          <StatusBadge status="published" />
          <StatusBadge status="active" />
          <StatusBadge status="completed" />
          <StatusBadge status="cancelled" />
          <StatusBadge status="pending" />
          <StatusBadge status="approved" />
          <StatusBadge status="rejected" />
          <StatusBadge status="expired" />
          <StatusBadge status="paid" />
          <StatusBadge status="unpaid" />
          <StatusBadge status="partial" />
        </Stack>
      </section>

      <Separator />

      {/* Status Indicator */}
      <section>
        <h3 className={styles.sectionTitle}>Status Indicators</h3>
        <Stack direction="horizontal" gap="lg" align="center">
          <StatusIndicator status="active" label="Active" pulse />
          <StatusIndicator status="pending" label="Pending" />
          <StatusIndicator status="inactive" label="Inactive" />
          <StatusIndicator status="success" label="Success" />
          <StatusIndicator status="warning" label="Warning" />
          <StatusIndicator status="danger" label="Danger" />
          <StatusIndicator status="info" label="Info" />
        </Stack>
      </section>

      <Separator />

      {/* Avatars */}
      <section>
        <h3 className={styles.sectionTitle}>Avatars</h3>
        <Stack direction="horizontal" gap="md" align="center">
          <Avatar size="xs" name="AB" />
          <Avatar size="sm" name="John Doe" />
          <Avatar size="md" name="Jane Smith" />
          <Avatar size="lg" name="Bob Wilson" />
          <Avatar size="xl" name="Alice Brown" />
        </Stack>
      </section>

      <Separator />

      {/* Cards */}
      <section>
        <h3 className={styles.sectionTitle}>Cards</h3>
        <Grid minItemWidth="280px" gap="md">
          <Card>
            <CardHeader title="Card Title" subtitle="With subtitle" action={<Button size="xs" variant="secondary">Action</Button>} />
            <CardBody>
              <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}>
                This is the card body content. It can contain anything.
              </p>
            </CardBody>
            <CardFooter>
              <Button size="sm" variant="secondary">Cancel</Button>
              <Button size="sm">Save</Button>
            </CardFooter>
          </Card>

          <Card padding="lg">
            <CardBody padding="lg">
              <EmptyState
                title="No data yet"
                description="Create your first item to get started."
                action={<Button size="sm">Create Item</Button>}
              />
            </CardBody>
          </Card>
        </Grid>
      </section>

      <Separator />

      {/* Pagination */}
      <section>
        <h3 className={styles.sectionTitle}>Pagination</h3>
        <Pagination page={3} totalPages={10} onPageChange={() => {}} />
      </section>

      <Separator />

      {/* Spinners */}
      <section>
        <h3 className={styles.sectionTitle}>Loading</h3>
        <Stack direction="horizontal" gap="lg" align="center">
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Stack>
      </section>

      <Separator />

      {/* Modal */}
      <section>
        <h3 className={styles.sectionTitle}>Modal</h3>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example Modal"
          description="This is a modal dialog with proper focus management."
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setModalOpen(false)}>Confirm</Button>
            </>
          }
        >
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-base)" }}>
            Modal content goes here. Press Escape or click outside to close.
          </p>
        </Modal>
      </section>
    </Stack>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Layout
   ═══════════════════════════════════════════════════════════════════════════ */

function LayoutSection() {
  return (
    <Stack gap="xl">
      <section>
        <h3 className={styles.sectionTitle}>Stack</h3>
        <Stack gap="md">
          <Stack direction="horizontal" gap="sm">
            <div className={styles.layoutBox}>1</div>
            <div className={styles.layoutBox}>2</div>
            <div className={styles.layoutBox}>3</div>
          </Stack>
          <Stack direction="horizontal" gap="md" justify="between">
            <div className={styles.layoutBox}>Left</div>
            <div className={styles.layoutBox}>Right</div>
          </Stack>
        </Stack>
      </section>

      <Separator />

      <section>
        <h3 className={styles.sectionTitle}>Grid</h3>
        <Grid columns={3} gap="md">
          <div className={styles.layoutBox}>Col 1</div>
          <div className={styles.layoutBox}>Col 2</div>
          <div className={styles.layoutBox}>Col 3</div>
          <div className={styles.layoutBox}>Col 4</div>
          <div className={styles.layoutBox}>Col 5</div>
          <div className={styles.layoutBox}>Col 6</div>
        </Grid>
      </section>

      <Separator />

      <section>
        <h3 className={styles.sectionTitle}>Container Sizes</h3>
        <Stack gap="md">
          {(["sm", "md", "lg", "xl"] as const).map((size) => (
            <Container key={size} size={size}>
              <div className={styles.layoutBox}>Container: {size}</div>
            </Container>
          ))}
        </Stack>
      </section>

      <Separator />

      <section>
        <h3 className={styles.sectionTitle}>Separator</h3>
        <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}>
          Content above
        </p>
        <Separator spacing="md" />
        <p style={{ fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}>
          Content below
        </p>
      </section>
    </Stack>
  );
}
