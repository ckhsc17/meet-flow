"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useMeetFlow } from "@/context/MeetFlowContext";

export function MembersTab() {
  const { members, addMember } = useMeetFlow();
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  function handleAddMember() {
    const name = newName.trim();
    if (!name) return;
    addMember(name);
    setNewName("");
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold">成員列表</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            共 {members.length} 位成員
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              加入成員
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>加入新成員</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <Input
                placeholder="輸入成員名稱"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                autoFocus
              />
              <Button onClick={handleAddMember} disabled={!newName.trim()}>
                確認加入
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback
                  className={`${m.color} text-white text-sm font-semibold`}
                >
                  {m.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.availability.length} 個空閒時段
                </p>
              </div>
              {m.id === "me" && (
                <Badge variant="outline" className="text-xs shrink-0">
                  你
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
