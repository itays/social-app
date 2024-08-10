"use client";

import { EditorContent, useEditor, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { submitPostAction } from "./actions";
import UserAvatar from "@/components/UserAvatar";
import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import "./editorStyles.css";
import { useIsMounted } from "@/components/hooks/useIsMounted";

export default function PostEditor() {
  const { user } = useSession();
  const isMounted = useIsMounted();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Write something …",
      }),
    ],
    immediatelyRender: false,
  });
  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  async function onSubmit() {
    await submitPostAction(input);
    editor?.commands.clearContent();
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow">
      <div className="flex gap-5">
        <UserAvatar avaterUrl={user.avatarUrl} className="hidden sm:inline" />
        {isMounted && (
          <EditorContent
            editor={editor}
            className="max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-gray-100 px-5 py-3 dark:bg-gray-900"
          />
        )}
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={!input.trim()}
          className="min-w-20"
        >
          Post
        </Button>
      </div>
    </div>
  );
}
