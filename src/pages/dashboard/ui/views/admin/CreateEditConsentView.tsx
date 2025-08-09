import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/supabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Types for the normalized structure
interface ConsentForm {
  id: number;
  title: string;
  subtitle: string;
  studyTitle: string;
  principalInvestigator: string;
  institution: string;
  irbProtocol: string;
  createdAt: string;
  updatedAt: string;
}

interface Block {
  id: string;
  formId: number;
  type: string;
  content: any;
  style?: any;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

const CreateEditConsentView = () => {
  const [consentForm, setConsentForm] = useState<ConsentForm | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  // Convert database format to frontend format
  const dbBlockToFrontend = (dbBlock: any): Block => ({
    id: dbBlock.id,
    formId: dbBlock.form_id,
    type: dbBlock.type,
    content: dbBlock.content,
    style: dbBlock.style,
    sortOrder: dbBlock.sort_order,
    createdAt: dbBlock.created_at,
    updatedAt: dbBlock.updated_at,
    createdBy: dbBlock.created_by,
    updatedBy: dbBlock.updated_by,
  });

  const dbFormToFrontend = (dbForm: any): ConsentForm => ({
    id: dbForm.id,
    title: dbForm.title,
    subtitle: dbForm.subtitle,
    studyTitle: dbForm.study_title,
    principalInvestigator: dbForm.principal_investigator,
    institution: dbForm.institution,
    irbProtocol: dbForm.irb_protocol,
    createdAt: dbForm.created_at,
    updatedAt: dbForm.updated_at,
  });

  // Load consent form and blocks
  const loadConsentForm = async () => {
    setLoading(true);
    try {
      // Load main form
      const { data: formData, error: formError } = await supabase
        .from("consent_forms")
        .select("*")
        .eq("is_active", true)
        .single();

      if (formError) {
        console.error("Error loading consent form:", formError);
        toast.error("Failed to load consent form");
        return;
      }

      if (formData) {
        setConsentForm(dbFormToFrontend(formData));

        // Load blocks for this form
        const { data: blocksData, error: blocksError } = await supabase
          .from("consent_form_blocks")
          .select("*")
          .eq("form_id", formData.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (blocksError) {
          console.error("Error loading blocks:", blocksError);
          toast.error("Failed to load blocks");
          return;
        }

        setBlocks((blocksData || []).map(dbBlockToFrontend));
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to load consent form");
    } finally {
      setLoading(false);
    }
  };

  // Update form metadata
  const updateFormField = async (field: string, value: any) => {
    if (!consentForm) return;

    try {
      const { error } = await supabase
        .from("consent_forms")
        .update({ [field]: value })
        .eq("id", consentForm.id);

      if (error) throw error;

      setConsentForm((prev) => (prev ? { ...prev, [field]: value } : null));
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      toast.error(`Failed to update ${field}`);
    }
  };

  // Update individual block
  const updateBlock = async (blockId: string, updates: Partial<Block>) => {
    try {
      const dbUpdates: any = {};
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.style !== undefined) dbUpdates.style = updates.style;
      if (updates.sortOrder !== undefined)
        dbUpdates.sort_order = updates.sortOrder;

      const { error } = await supabase
        .from("consent_form_blocks")
        .update(dbUpdates)
        .eq("id", blockId);

      if (error) throw error;

      // Update local state
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId ? { ...block, ...updates } : block
        )
      );
    } catch (err) {
      console.error("Failed to update block:", err);
      toast.error("Failed to update block");
    }
  };

  // Add new block
  const addBlock = async (type: string) => {
    if (!consentForm) return;

    const newSortOrder = Math.max(...blocks.map((b) => b.sortOrder), 0) + 1;

    try {
      const { data, error } = await supabase
        .from("consent_form_blocks")
        .insert({
          form_id: consentForm.id,
          type,
          content: getDefaultContent(type),
          style: getDefaultStyle(type),
          sort_order: newSortOrder,
        })
        .select()
        .single();

      if (error) throw error;

      const newBlock = dbBlockToFrontend(data);
      setBlocks((prev) => [...prev, newBlock]);
      setEditingBlock(newBlock.id);

      toast.success("Block added successfully");
    } catch (err) {
      console.error("Failed to add block:", err);
      toast.error("Failed to add block");
    }
  };

  // Delete block
  const deleteBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from("consent_form_blocks")
        .update({ is_active: false })
        .eq("id", blockId);

      if (error) throw error;

      setBlocks((prev) => prev.filter((block) => block.id !== blockId));
      toast.success("Block deleted successfully");
    } catch (err) {
      console.error("Failed to delete block:", err);
      toast.error("Failed to delete block");
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    loadConsentForm();

    // Subscribe to form changes
    const formChannel = supabase
      .channel("consent-forms-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consent_forms",
        },
        (payload) => {
          console.log("[Realtime] Form changed:", payload);

          // Type guard and null checks
          if (
            payload.new &&
            typeof payload.new === "object" &&
            "id" in payload.new &&
            payload.new.id === consentForm?.id
          ) {
            setConsentForm(dbFormToFrontend(payload.new as any));
          }
        }
      )
      .subscribe();

    // Subscribe to block changes
    const blocksChannel = supabase
      .channel("consent-form-blocks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consent_form_blocks",
        },
        (payload) => {
          console.log("[Realtime] Block changed:", payload);

          if (payload.eventType === "INSERT" && payload.new) {
            // Type guard for INSERT events
            if (typeof payload.new === "object" && "form_id" in payload.new) {
              const newBlock = dbBlockToFrontend(payload.new as any);
              if (newBlock.formId === consentForm?.id) {
                setBlocks((prev) => {
                  // Check if block already exists to prevent duplicates
                  if (prev.find((b) => b.id === newBlock.id)) return prev;
                  return [...prev, newBlock].sort(
                    (a, b) => a.sortOrder - b.sortOrder
                  );
                });
              }
            }
          }

          if (payload.eventType === "UPDATE" && payload.new) {
            // Type guard for UPDATE events
            if (typeof payload.new === "object" && "form_id" in payload.new) {
              const updatedBlock = dbBlockToFrontend(payload.new as any);
              if (updatedBlock.formId === consentForm?.id) {
                setBlocks((prev) =>
                  prev.map((block) =>
                    block.id === updatedBlock.id ? updatedBlock : block
                  )
                );
              }
            }
          }

          if (payload.eventType === "DELETE" && payload.old) {
            // Type guard for DELETE events
            if (typeof payload.old === "object" && "id" in payload.old) {
              setBlocks((prev) =>
                prev.filter((block) => block.id !== (payload.old as any).id)
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(formChannel);
      supabase.removeChannel(blocksChannel);
    };
  }, [consentForm?.id]);

  // Helper functions for default content
  const getDefaultContent = (type: string) => {
    switch (type) {
      case "section_header":
        return { text: "New Section Header" };
      case "paragraph":
        return { text: "Enter paragraph content here..." };
      case "list":
        return { items: ["List item 1", "List item 2"] };
      case "info_box":
        return { text: "Information box content" };
      case "info_box_list":
        return { items: ["Info item 1", "Info item 2"] };
      case "two_column_box":
        return {
          left: { title: "Left Title", items: ["Left item 1"] },
          right: { title: "Right Title", items: ["Right item 1"] },
        };
      case "two_column_info":
        return {
          left: { title: "Left Title", content: "Left content" },
          right: { title: "Right Title", content: "Right content" },
        };
      default:
        return { text: "" };
    }
  };

  const getDefaultStyle = (type: string) => {
    switch (type) {
      case "info_box":
        return { background: "yellow", fontWeight: "semibold" };
      case "two_column_box":
        return { leftColor: "red", rightColor: "green" };
      default:
        return null;
    }
  };

  // Block rendering components
  const BlockRenderer = ({ block }: { block: Block }) => {
    const { type, content, style } = block;

    const getBackgroundClass = (background: string) => {
      const backgroundMap: { [key: string]: string } = {
        gray: "bg-gray-50 dark:bg-gray-900",
        blue: "bg-blue-50 dark:bg-blue-900/20",
        red: "bg-red-50 dark:bg-red-900/20",
        green: "bg-green-50 dark:bg-green-900/20",
        yellow: "bg-yellow-50 dark:bg-yellow-900/20",
      };
      return backgroundMap[background] || "";
    };

    switch (type) {
      case "section_header":
        return (
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
            {content.text}
          </h3>
        );
      case "paragraph":
        return (
          <p
            className={style?.fontWeight === "semibold" ? "font-semibold" : ""}
          >
            {content.text}
          </p>
        );
      case "list":
        const listBg = style?.background
          ? getBackgroundClass(style.background)
          : "";
        return (
          <div className={`p-4 rounded-lg ${listBg}`}>
            <ul className="list-disc pl-6 space-y-1">
              {content.items?.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        );
      case "info_box":
        const infoBg = style?.background
          ? getBackgroundClass(style.background)
          : "";
        const infoWeight =
          style?.fontWeight === "semibold" ? "font-semibold" : "font-medium";
        return (
          <div className={`p-4 rounded-lg mb-3 ${infoBg}`}>
            <p className={`${infoWeight}`}>{content.text}</p>
          </div>
        );
      case "info_box_list":
        const boxListBg = style?.background
          ? getBackgroundClass(style.background)
          : "";
        return (
          <div className={`p-4 rounded-lg ${boxListBg}`}>
            <ul className="space-y-2">
              {content.items?.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        );
      case "two_column_box":
        const leftBg = style?.leftColor
          ? getBackgroundClass(style.leftColor)
          : "";
        const rightBg = style?.rightColor
          ? getBackgroundClass(style.rightColor)
          : "";
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${leftBg}`}>
              <h4 className="font-medium mb-2">{content.left?.title}</h4>
              <ul className="text-sm space-y-1">
                {content.left?.items?.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={`p-4 rounded-lg ${rightBg}`}>
              <h4 className="font-medium mb-2">{content.right?.title}</h4>
              <ul className="text-sm space-y-1">
                {content.right?.items?.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "two_column_info":
        const twoBg = style?.background
          ? getBackgroundClass(style.background)
          : "";
        return (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className={`p-4 rounded-lg ${twoBg}`}>
              <h4 className="font-medium mb-2">{content.left?.title}</h4>
              <div>{content.left?.content}</div>
            </div>
            <div className={`p-4 rounded-lg ${twoBg}`}>
              <h4 className="font-medium mb-2">{content.right?.title}</h4>
              <div>{content.right?.content}</div>
            </div>
          </div>
        );
      default:
        return <div>Unknown block type: {type}</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          <p>Loading consent form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Editor */}
          <div className="space-y-6">
            {/* Form metadata editor */}
            <div className="border p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Form Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <Input
                    type="text"
                    value={consentForm?.title || ""}
                    onChange={(e) => updateFormField("title", e.target.value)}
                    placeholder="Consent form title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subtitle
                  </label>
                  <Input
                    type="text"
                    value={consentForm?.subtitle || ""}
                    onChange={(e) =>
                      updateFormField("subtitle", e.target.value)
                    }
                    placeholder="Consent form subtitle"
                  />
                </div>
                {/* Research info fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Study Title
                    </label>
                    <Input
                      type="text"
                      value={consentForm?.studyTitle || ""}
                      onChange={(e) =>
                        updateFormField("study_title", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Principal Investigator
                    </label>
                    <Input
                      type="text"
                      value={consentForm?.principalInvestigator || ""}
                      onChange={(e) =>
                        updateFormField(
                          "principal_investigator",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Institution
                    </label>
                    <Input
                      type="text"
                      value={consentForm?.institution || ""}
                      onChange={(e) =>
                        updateFormField("institution", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      IRB Protocol
                    </label>
                    <Input
                      type="text"
                      value={consentForm?.irbProtocol || ""}
                      onChange={(e) =>
                        updateFormField("irb_protocol", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Blocks editor */}
            <div className="space-y-4">
              {blocks.map((block) => (
                <div key={block.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded">
                        {block.type.replace(/_/g, " ").toUpperCase()}
                      </span>
                      <span className="text-sm">Item: {block.sortOrder}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          setEditingBlock(
                            editingBlock === block.id ? null : block.id
                          )
                        }
                        className="px-4 py-1 text-smrounded"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteBlock(block.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Block content editor */}
                  {editingBlock === block.id && (
                    <div className="space-y-3 border-t pt-3">
                      {(block.type === "paragraph" ||
                        block.type === "section_header" ||
                        block.type === "info_box") && (
                        <Textarea
                          value={block.content.text || ""}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              content: {
                                ...block.content,
                                text: e.target.value,
                              },
                            })
                          }
                          rows={3}
                          placeholder={`Enter ${block.type.replace("_", " ")} content...`}
                        />
                      )}

                      {(block.type === "list" ||
                        block.type === "info_box_list") && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            List Items (one per line)
                          </label>
                          <Textarea
                            value={
                              Array.isArray(block.content.items)
                                ? block.content.items.join("\n")
                                : ""
                            }
                            onChange={(e) =>
                              updateBlock(block.id, {
                                content: {
                                  ...block.content,
                                  items: e.target.value
                                    .split("\n")
                                    .filter((item) => item.trim()),
                                },
                              })
                            }
                            rows={4}
                            placeholder="Item 1&#10;Item 2&#10;Item 3"
                          />
                        </div>
                      )}

                      {block.type === "two_column_box" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Left Title
                            </label>
                            <Input
                              type="text"
                              value={block.content.left?.title || ""}
                              onChange={(e) =>
                                updateBlock(block.id, {
                                  content: {
                                    ...block.content,
                                    left: {
                                      ...block.content.left,
                                      title: e.target.value,
                                    },
                                  },
                                })
                              }
                            />
                            <label className="block text-sm font-medium mb-2 mt-2">
                              Left Items (one per line)
                            </label>
                            <Textarea
                              value={
                                Array.isArray(block.content.left?.items)
                                  ? block.content.left.items.join("\n")
                                  : ""
                              }
                              onChange={(e) =>
                                updateBlock(block.id, {
                                  content: {
                                    ...block.content,
                                    left: {
                                      ...block.content.left,
                                      items: e.target.value
                                        .split("\n")
                                        .filter((item) => item.trim()),
                                    },
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Right Title
                            </label>
                            <Input
                              type="text"
                              value={block.content.right?.title || ""}
                              onChange={(e) =>
                                updateBlock(block.id, {
                                  content: {
                                    ...block.content,
                                    right: {
                                      ...block.content.right,
                                      title: e.target.value,
                                    },
                                  },
                                })
                              }
                            />
                            <label className="block text-sm font-medium mb-2 mt-2">
                              Right Items (one per line)
                            </label>
                            <Textarea
                              value={
                                Array.isArray(block.content.right?.items)
                                  ? block.content.right.items.join("\n")
                                  : ""
                              }
                              onChange={(e) =>
                                updateBlock(block.id, {
                                  content: {
                                    ...block.content,
                                    right: {
                                      ...block.content.right,
                                      items: e.target.value
                                        .split("\n")
                                        .filter((item) => item.trim()),
                                    },
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                      )}

                      {block.type === "two_column_info" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Left Title
                            </label>
                            <Input
                              type="text"
                              value={block.content.left?.title || ""}
                              onChange={(e) =>
                                updateBlock(block.id, {
                                  content: {
                                    ...block.content,
                                    left: {
                                      ...block.content.left,
                                      title: e.target.value,
                                    },
                                  },
                                })
                              }
                            />
                            <label className="block text-sm font-medium mb-2 mt-2">
                              Left Content
                            </label>
                            <Textarea
                              value={block.content.left?.content || ""}
                              onChange={(e) =>
                                updateBlock(block.id, {
                                  content: {
                                    ...block.content,
                                    left: {
                                      ...block.content.left,
                                      content: e.target.value,
                                    },
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Right Title
                            </label>
                            <Input
                              type="text"
                              value={block.content.right?.title || ""}
                              onChange={(e) =>
                                updateBlock(block.id, {
                                  content: {
                                    ...block.content,
                                    right: {
                                      ...block.content.right,
                                      title: e.target.value,
                                    },
                                  },
                                })
                              }
                            />
                            <label className="block text-sm font-medium mb-2 mt-2">
                              Right Content
                            </label>
                            <Textarea
                              value={block.content.right?.content || ""}
                              onChange={(e) =>
                                updateBlock(block.id, {
                                  content: {
                                    ...block.content,
                                    right: {
                                      ...block.content.right,
                                      content: e.target.value,
                                    },
                                  },
                                })
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Block preview */}
                  <div className="mt-3 p-2 bg-muted rounded">
                    <BlockRenderer block={block} />
                  </div>
                </div>
              ))}
            </div>

            {/* Add block controls */}
            <div className="border p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Add Content Block</h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "section_header", label: "Section Header" },
                  { value: "paragraph", label: "Paragraph" },
                  { value: "list", label: "List" },
                  { value: "info_box", label: "Info Box" },
                  { value: "info_box_list", label: "Info Box List" },
                  { value: "two_column_box", label: "Two Column Box" },
                  { value: "two_column_info", label: "Two Column Info" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => addBlock(type.value)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="space-y-6">
            <div className="border rounded-lg sticky top-8">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Live Preview</h2>
              </div>
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                {consentForm && (
                  <div className="space-y-6 text-sm leading-relaxed">
                    <div>
                      <h1 className="text-xl font-bold mb-2">
                        {consentForm.title}
                      </h1>
                      <p>{consentForm.subtitle}</p>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
                      <h3 className="font-semibold text-blue-900 mb-1">
                        STUDY TITLE: {consentForm.studyTitle}
                      </h3>
                      <p className="text-blue-800 text-xs">
                        Principal Investigator:{" "}
                        {consentForm.principalInvestigator} • Institution:{" "}
                        {consentForm.institution} • IRB Protocol:{" "}
                        {consentForm.irbProtocol}
                      </p>
                    </div>

                    {blocks.map((block) => (
                      <div
                        key={block.id}
                        className="border-b border-gray-200 pb-4 last:border-b-0"
                      >
                        <BlockRenderer block={block} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditConsentView;
