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
import {
  Select,
  SelectContent,
  SelectItem,
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const html = `
                        <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:24px; color:#111827">
                          <div style="border:1px solid #e5e7eb; padding:20px; border-radius:8px; max-width:720px; margin:0 auto">
                            <h1 style="font-size:18px; margin-bottom:8px">Registrant Details</h1>
                            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f3f4f6"><div style="color:#6b7280; width:140px">ID</div><div style="font-weight:600">${r.id}</div></div>
                            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f3f4f6"><div style="color:#6b7280; width:140px">Name</div><div style="font-weight:600">${(r.firstName??"") + (r.lastName?" "+r.lastName:"")}</div></div>
                            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f3f4f6"><div style="color:#6b7280; width:140px">Email</div><div style="font-weight:600">${r.email ?? "—"}</div></div>
                            <div style="display:flex; justify-content:space-between; padding:8px 0"><div style="color:#6b7280; width:140px">Registered</div><div style="font-weight:600">${r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</div></div>
                          </div>
                        </div>
                      `

                      // Render printable HTML in the current document body, trigger print, then reload app
                      try {
                        const originalBody = document.body.innerHTML
                        document.body.innerHTML = html
                        window.print()
                        // restore by reloading to ensure React app state is consistent
                        window.location.reload()
                      } catch (e) {
                        console.error('Print failed', e)
                      }
                    }}
                  >
                    Print
                  </Button>
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
  }, [page, pageSize]);

  function prev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function next() {
    setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin — Registrants</h1>
        <div className="flex items-center gap-2">
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
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrants.map((r) => (
              <TableRow key={r.id}>
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
                    onClick={() => {
                      const html = `
                          <html>
                          <head>
                            <title>Registrant ${r.id}</title>
                            <style>
                              body { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 24px; color: #111827; }
                              .card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; max-width: 720px; margin: 0 auto; }
                              h1 { font-size: 18px; margin-bottom: 8px; }
                              .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f3f4f6 }
                              .label { color:#6b7280; width:140px }
                              .value { font-weight:600 }
                              @media print { button{ display:none } }
                            </style>
                          </head>
                          <body>
                            <div class="card">
                              <h1>Registrant Details</h1>
                              <div class="row"><div class="label">ID</div><div class="value">${r.id}</div></div>
                              <div class="row"><div class="label">Name</div><div class="value">${(r.firstName ?? "") + (r.lastName ? " " + r.lastName : "")}</div></div>
                              <div class="row"><div class="label">Email</div><div class="value">${r.email ?? "—"}</div></div>
                              <div class="row"><div class="label">Registered</div><div class="value">${r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</div></div>
                            </div>
                            <script>window.print();</script>
                          </body>
                          </html>
                        `;
                      const w = window.open("", "_blank");
                      if (w) {
                        w.document.open();
                        w.document.write(html);
                        w.document.close();
                      }
                    }}
                  >
                    Print
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {registrants.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
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
