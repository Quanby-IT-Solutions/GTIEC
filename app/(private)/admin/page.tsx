"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";

type Registrant = {
  id: string;
  full_name?: string | null;
  fullName?: string | null;
  designation?: string | null;
  company_name?: string | null;
  companyName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  createdAt?: string | null;
};

const DEFAULT_PAGE_SIZE = 10;

function getPrintableName(registrant: Registrant) {
  const nameFromParts =
    `${registrant.firstName ?? ""} ${registrant.lastName ?? ""}`.trim();
  const candidates = [registrant.full_name, registrant.fullName, nameFromParts];

  return (
    candidates.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    ) ?? "—"
  );
}

function getPrintableCompanyName(registrant: Registrant) {
  return registrant.company_name ?? registrant.companyName ?? "—";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function getPrintFontSize(value: string) {
  const characterCount = Math.max(value.trim().length, 1);

  return Math.min(54, Math.max(12, 520 / characterCount));
}

function getRegistrantPrintLines(registrant: Registrant) {
  return [getPrintableName(registrant), getPrintableCompanyName(registrant)].map(
    (value) => ({
      text: escapeHtml(value),
      fontSize: getPrintFontSize(value),
    }),
  );
}

function createPrintHtml(registrants: Registrant[]) {
  const cards = registrants
    .map((registrant) => {
      const printLines = getRegistrantPrintLines(registrant);

      return `
        <section class="card">
          <div class="print-area">
            <div class="line" style="font-size: ${printLines[0].fontSize}pt;">${printLines[0].text}</div>
            <div class="line" style="font-size: ${printLines[1].fontSize}pt;">${printLines[1].text}</div>
          </div>
        </section>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Registrant Card</title>
        <style>
          @page {
            size: 4in 4in;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 4in;
            overflow: visible;
            font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .card {
            box-sizing: border-box;
            width: 4in;
            height: 4in;
            margin: 0;
            padding: 0;
            background: #ffffff;
            border: 0;
            break-after: page;
            page-break-after: always;
            overflow: hidden;
          }
          .card:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .print-area {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            height: 2in;
            margin: 0;
            padding: 0;
          }
          .line {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow: hidden;
            color: #0f172a;
            font-weight: 900;
            line-height: 0.95;
            overflow-wrap: anywhere;
            word-break: break-word;
            text-align: center;
          }
        </style>
      </head>
      <body>${cards}</body>
    </html>
  `;
}

function printRegistrants(registrants: Registrant[]) {
  if (registrants.length === 0) return;

  try {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const cleanup = () => {
      iframe.remove();
    };

    iframe.onload = () => {
      const targetWindow = iframe.contentWindow;
      if (!targetWindow) {
        cleanup();
        return;
      }

      targetWindow.focus();
      targetWindow.print();
      targetWindow.onafterprint = cleanup;
      setTimeout(cleanup, 1500);
    };

    iframe.srcdoc = createPrintHtml(registrants);
  } catch (e) {
    console.error("Print failed", e);
  }
}

export default function AdminPage() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [selectedRegistrantIds, setSelectedRegistrantIds] = useState<string[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => {
    if (total == null) return null;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);
  const selectedRegistrantIdSet = useMemo(
    () => new Set(selectedRegistrantIds),
    [selectedRegistrantIds],
  );
  const selectedRegistrants = useMemo(
    () => registrants.filter((registrant) => selectedRegistrantIdSet.has(registrant.id)),
    [registrants, selectedRegistrantIdSet],
  );
  const allVisibleSelected =
    registrants.length > 0 &&
    registrants.every((registrant) => selectedRegistrantIdSet.has(registrant.id));

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortDir]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: String(pageSize),
          page: String(page),
          sortBy,
          sortDir,
        });
        if (search.trim().length > 0) {
          params.set("q", search.trim());
        }

        const res = await fetch(`/api/registrants?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (!mounted) return;
        setRegistrants(json.items || []);
        setTotal(typeof json.total === "number" ? json.total : null);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [page, pageSize, search, sortBy, sortDir]);

  function prev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function next() {
    setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1));
  }
  function toggleRegistrantSelection(registrantId: string, checked: boolean) {
    setSelectedRegistrantIds((current) =>
      checked
        ? [...new Set([...current, registrantId])]
        : current.filter((id) => id !== registrantId),
    );
  }
  function toggleVisibleSelection(checked: boolean) {
    const visibleIds = registrants.map((registrant) => registrant.id);

    setSelectedRegistrantIds((current) =>
      checked
        ? [...new Set([...current, ...visibleIds])]
        : current.filter((id) => !visibleIds.includes(id)),
    );
  }

  return (
    <div className="p-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Admin — Registrants</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, designation, company"
            className="h-9 w-[280px]"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Registered date</SelectItem>
              <SelectItem value="full_name">Full name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="designation">Designation</SelectItem>
              <SelectItem value="company_name">Company name</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortDir}
            onValueChange={(value) => setSortDir(value as "asc" | "desc")}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Asc</SelectItem>
              <SelectItem value="desc">Desc</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
            defaultValue={`${DEFAULT_PAGE_SIZE}`}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={selectedRegistrants.length === 0}
            onClick={() => printRegistrants(selectedRegistrants)}
          >
            Print selected ({selectedRegistrants.length})
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all visible registrants"
                  checked={allVisibleSelected}
                  onCheckedChange={(checked) =>
                    toggleVisibleSelection(checked === true)
                  }
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrants.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${getPrintableName(r)}`}
                    checked={selectedRegistrantIdSet.has(r.id)}
                    onCheckedChange={(checked) =>
                      toggleRegistrantSelection(r.id, checked === true)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium text-sm">{r.id}</TableCell>
                <TableCell>
                  {`${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || "—"}
                </TableCell>
                <TableCell>{r.email ?? "—"}</TableCell>
                <TableCell>
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => printRegistrants([r])}
                  >
                    Print
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {registrants.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  {loading ? "Loading..." : "No registrants"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {total != null
            ? `Showing page ${page} of ${totalPages} — ${total} total`
            : `Page ${page}`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={prev}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={next}
            disabled={loading || (totalPages != null && page >= totalPages)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
