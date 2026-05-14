"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
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
import { Badge } from "../../../components/ui/badge";

type Registrant = {
  id?: string | null;
  full_name?: string | null;
  fullName?: string | null;
  company_name?: string | null;
  companyName?: string | null;
  contact_no?: string | null;
  contactNo?: string | null;
  email?: string | null;
  printedAt?: string | null;
};

const DEFAULT_PAGE_SIZE = 10;

function getPrintableName(registrant: Registrant) {
  const candidates = [registrant.full_name, registrant.fullName];

  return (
    candidates.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    ) ?? "—"
  );
}

function getPrintableCompanyName(registrant: Registrant) {
  return registrant.company_name ?? registrant.companyName ?? "—";
}

function getRegistrantKey(registrant: Registrant, index: number) {
  if (registrant.id) return registrant.id;
  return `${getPrintableName(registrant)}::${getPrintableCompanyName(registrant)}::${index}`;
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
  const fontSize = Math.min(44, Math.max(20, 520 / characterCount));

  return Math.max(18, fontSize - 2);
}

function getPrintFontSizes(registrants: Registrant[]) {
  const longestNameLength = Math.max(
    1,
    ...registrants.map((registrant) => getPrintableName(registrant).trim().length),
  );
  const longestCompanyLength = Math.max(
    1,
    ...registrants.map((registrant) =>
      getPrintableCompanyName(registrant).trim().length,
    ),
  );

  return {
    name: getPrintFontSize("x".repeat(longestNameLength)),
    company: getPrintFontSize("x".repeat(longestCompanyLength)),
  };
}

function createPrintHtml(registrants: Registrant[]) {
  const fontSizes = getPrintFontSizes(registrants);
  const cards = registrants
    .reduce<Registrant[][]>((pages, registrant, index) => {
      if (index % 2 === 0) {
        pages.push([]);
      }

      pages[pages.length - 1].push(registrant);

      return pages;
    }, [])
    .map((pageRegistrants) => {
      const labels = pageRegistrants
        .map((registrant) => {
          const printableName = escapeHtml(getPrintableName(registrant));
          const printableCompanyName = escapeHtml(
            getPrintableCompanyName(registrant),
          );

          return `
          <div class="label">
            <div class="line name">${printableName}</div>
            <div class="line company">${printableCompanyName}</div>
          </div>
        `;
        })
        .join("");

      return `
        <section class="card">
          ${labels}
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
          .label {
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
            overflow: hidden;
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
          .name {
            font-size: ${fontSizes.name}pt;
          }
          .company {
            font-size: ${fontSizes.company}pt;
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
  const [selectedRegistrantKeys, setSelectedRegistrantKeys] = useState<string[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return null;

    return createClient(url, anonKey);
  }, []);

  const totalPages = useMemo(() => {
    if (total == null) return null;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);
  const selectedRegistrantIdSet = useMemo(
    () => new Set(selectedRegistrantKeys),
    [selectedRegistrantKeys],
  );
  const selectedRegistrants = useMemo(
    () =>
      registrants.filter((registrant, index) =>
        selectedRegistrantIdSet.has(getRegistrantKey(registrant, index)),
      ),
    [registrants, selectedRegistrantIdSet],
  );
  const allVisibleSelected =
    registrants.length > 0 &&
    registrants.every((registrant, index) =>
      selectedRegistrantIdSet.has(getRegistrantKey(registrant, index)),
    );

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortDir]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!mounted) return;
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
  }, [page, pageSize, search, sortBy, sortDir, refreshTick]);

  useEffect(() => {
    if (!supabase) return;

    const handleRealtimeChange = () => {
      setRefreshTick((current) => current + 1);
    };

    const channel = supabase
      .channel("registrants-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Registrant" },
        handleRealtimeChange,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrants" },
        handleRealtimeChange,
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRefreshTick((current) => current + 1);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRefreshTick((current) => current + 1);
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  function prev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function next() {
    setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1));
  }
  function toggleRegistrantSelection(registrantKey: string, checked: boolean) {
    setSelectedRegistrantKeys((current) =>
      checked
        ? [...new Set([...current, registrantKey])]
        : current.filter((key) => key !== registrantKey),
    );
  }
  function toggleVisibleSelection(checked: boolean) {
    const visibleKeys = registrants.map((registrant, index) =>
      getRegistrantKey(registrant, index),
    );

    setSelectedRegistrantKeys((current) =>
      checked
        ? [...new Set([...current, ...visibleKeys])]
        : current.filter((key) => !visibleKeys.includes(key)),
    );
  }

  async function markRegistrantsPrinted(items: Registrant[]) {
    const ids = items
      .map((registrant) => registrant.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (ids.length === 0) return;
    try {
      const res = await fetch("/api/registrants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to mark registrants as printed");
      setRefreshTick((current) => current + 1);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteRegistrantIds(ids: string[]) {
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/registrants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to delete registrants");
      setSelectedRegistrantKeys((current) =>
        current.filter((key) => !ids.includes(key)),
      );
      setRefreshTick((current) => current + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  async function deleteSingleRegistrant(registrant: Registrant) {
    if (!registrant.id) return;
    await deleteRegistrantIds([registrant.id]);
  }

  async function deleteSelectedRegistrants() {
    await deleteRegistrantIds(selectedRegistrantKeys);
  }

  return (
    <div className="p-8">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Admin — Registrants</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search full name or company"
            className="h-9 w-[280px]"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Registered date</SelectItem>
              <SelectItem value="full_name">Full name</SelectItem>
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
            onClick={() => {
              printRegistrants(selectedRegistrants);
              void markRegistrantsPrinted(selectedRegistrants);
            }}
          >
            Print selected ({selectedRegistrants.length})
          </Button>
          <Button
            variant="destructive"
            disabled={selectedRegistrantKeys.length === 0 || deleting}
            onClick={deleteSelectedRegistrants}
          >
            Delete selected ({selectedRegistrantKeys.length})
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
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact No</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrants.map((r, index) => {
              const rowKey = getRegistrantKey(r, index);
              return (
              <TableRow key={rowKey}>
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${getPrintableName(r)}`}
                    checked={selectedRegistrantIdSet.has(rowKey)}
                    onCheckedChange={(checked) =>
                      toggleRegistrantSelection(rowKey, checked === true)
                    }
                  />
                </TableCell>
                <TableCell>{getPrintableName(r)}</TableCell>
                <TableCell>{getPrintableCompanyName(r)}</TableCell>
                <TableCell>{r.contact_no ?? r.contactNo ?? "—"}</TableCell>
                <TableCell>{r.email ?? "—"}</TableCell>
                <TableCell>
                  {r.printedAt ? (
                    <Badge variant="secondary">Printed</Badge>
                  ) : (
                    <Badge variant="outline">Not printed</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        printRegistrants([r]);
                        void markRegistrantsPrinted([r]);
                      }}
                    >
                      Print
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteSingleRegistrant(r)}
                      disabled={!r.id || deleting}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )})}
            {registrants.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
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
