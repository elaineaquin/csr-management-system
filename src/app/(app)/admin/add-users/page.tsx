"use client";
import { useState } from "react";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { SectionWrapper } from "@/components/section-wrapper";
import { AccessGuard } from "@/components/access-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Trash2,
  Upload,
  Download,
  Edit,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { roleMap } from "@/components/role-display";
import type { RoleKey } from "@/lib/permissions";
import { admin } from "@/lib/auth-client";

interface UserType {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleKey | RoleKey[];
}

const availableRoles = Object.keys(roleMap) as RoleKey[];

export default function AddUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as RoleKey | RoleKey[],
  });
  const [multipleRoles, setMultipleRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<RoleKey[]>([
    availableRoles[0],
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [editingValues, setEditingValues] = useState<{
    name: string;
    email: string;
  }>({ name: "", email: "" });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addUser = () => {
    if (!currentUser.name || !currentUser.email || !currentUser.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailExists = users.some((user) => user.email === currentUser.email);
    if (emailExists) {
      toast.error("A user with this email already exists");
      return;
    }

    const newUser: UserType = {
      id: generateId(),
      ...currentUser,
      role: multipleRoles ? selectedRoles : currentUser.role,
    };

    setUsers([...users, newUser]);
    setCurrentUser({ name: "", email: "", password: "", role: "user" });
    setSelectedRoles([availableRoles[0]]);
    setMultipleRoles(false);

    toast.success("User added to the list");
  };

  const removeUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
    toast.success("User removed from the list");
  };

  const startEditing = (user: UserType) => {
    setEditingId(user.id);
    setEditingValues({ name: user.name, email: user.email });
  };

  const saveEdit = (
    id: string,
    updatedUser: { name: string; email: string }
  ) => {
    setUsers(
      users.map((user) => (user.id === id ? { ...user, ...updatedUser } : user))
    );
    setEditingId(null);
    setEditingValues({ name: "", email: "" });
    toast.success("User updated successfully");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValues({ name: "", email: "" });
  };

  const handleRoleChange = (role: RoleKey, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, role]);
    } else {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    }
  };

  const parseBulkText = () => {
    const lines = bulkText.trim().split("\n");
    const newUsers: UserType[] = [];

    for (const line of lines) {
      const parts = line.split(",").map((part) => part.trim());
      if (parts.length >= 3) {
        const [name, email, password, ...roleParts] = parts;
        const roles = roleParts.length > 0 ? roleParts : ["user"];

        const emailExists = [...users, ...newUsers].some(
          (user) => user.email === email
        );
        if (!emailExists) {
          newUsers.push({
            id: generateId(),
            name,
            email,
            password,
            role: (roles.length === 1 ? roles[0] : roles) as RoleKey[],
          });
        }
      }
    }

    if (newUsers.length > 0) {
      setUsers([...users, ...newUsers]);
      setBulkText("");
      toast.success(`${newUsers.length} users added from bulk import`);
    } else {
      toast.error("No valid users found in the text");
    }
  };

  const submitAllUsers = async () => {
    if (users.length === 0) {
      toast.error("No users to submit");
      return;
    }

    setIsSubmitting(true);
    try {
      for (const user of users) {
        await admin.createUser({
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
        });
      }

      toast.success(`${users.length} users created successfully`);
      setUsers([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create users. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportTemplate = () => {
    const template =
      "Name,Email,Password,Role1,Role2\nJohn Doe,john@example.com,password123,user\nJane Smith,jane@example.com,password456,user,admin";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-users-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AccessGuard page="adminPanel">
      <PageHeader>
        <div className="flex flex-col items-start gap-2">
          <PageHeaderHeading>Add Users</PageHeaderHeading>
          <PageHeaderDescription>
            Add individual users or import multiple users at once
          </PageHeaderDescription>
        </div>
        <PageActions>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <X className="h-4 w-4" />
              Cancel
            </Link>
          </Button>
          <Button
            onClick={submitAllUsers}
            disabled={users.length === 0 || isSubmitting}
          >
            <Users className="h-4 w-4" />
            {isSubmitting ? "Creating..." : `Create ${users.length} Users`}
          </Button>
        </PageActions>
      </PageHeader>

      <SectionWrapper>
        <div className="space-y-6">
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual Entry</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Add New User
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={currentUser.name}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={currentUser.email}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={currentUser.password}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            password: e.target.value,
                          })
                        }
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role Assignment</Label>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="multiple-roles"
                          checked={multipleRoles}
                          onCheckedChange={(checked) =>
                            setMultipleRoles(checked as boolean)
                          }
                        />
                        <Label htmlFor="multiple-roles" className="text-sm">
                          Allow multiple roles
                        </Label>
                      </div>
                      {multipleRoles ? (
                        <div className="space-y-2">
                          {availableRoles.map((roleKey) => (
                            <div
                              key={roleKey}
                              className="flex items-start space-x-2 p-2 rounded-lg border"
                            >
                              <Checkbox
                                id={roleKey}
                                checked={selectedRoles.includes(roleKey)}
                                onCheckedChange={(checked) =>
                                  handleRoleChange(roleKey, checked as boolean)
                                }
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={roleKey}
                                  className="flex items-center text-sm font-medium cursor-pointer"
                                >
                                  {roleMap[roleKey].icon}
                                  {roleMap[roleKey].label}
                                </Label>
                                {roleMap[roleKey].description && (
                                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                                    {roleMap[roleKey].description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Select
                          value={currentUser.role as string}
                          onValueChange={(value) =>
                            setCurrentUser({
                              ...currentUser,
                              role: value as RoleKey,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((roleKey) => (
                              <SelectItem key={roleKey} value={roleKey}>
                                <div className="flex items-center">
                                  {roleMap[roleKey].icon}
                                  <span>{roleMap[roleKey].label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <Button onClick={addUser} className="w-full">
                    <UserPlus className="h-4 w-4" />
                    Add User to List
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Bulk Import Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Button variant="outline" onClick={exportTemplate}>
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Download a CSV template to see the expected format
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk-text">
                      Paste CSV Data (Name, Email, Password, Role1, Role2...)
                    </Label>
                    <Textarea
                      id="bulk-text"
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder="John Doe,john@example.com,password123,user&#10;Jane Smith,jane@example.com,password456,user,admin"
                      rows={8}
                    />
                  </div>
                  <Button onClick={parseBulkText} className="w-full">
                    <Upload className="h-4 w-4" />
                    Import Users
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {users.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Users to Create ({users.length})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsers([])}
                  >
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            {editingId === user.id ? (
                              <Input
                                value={editingValues.name}
                                onChange={(e) =>
                                  setEditingValues({
                                    ...editingValues,
                                    name: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    saveEdit(user.id, editingValues);
                                  } else if (e.key === "Escape") {
                                    cancelEdit();
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              user.name
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === user.id ? (
                              <Input
                                value={editingValues.email}
                                onChange={(e) =>
                                  setEditingValues({
                                    ...editingValues,
                                    email: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    saveEdit(user.id, editingValues);
                                  } else if (e.key === "Escape") {
                                    cancelEdit();
                                  }
                                }}
                              />
                            ) : (
                              user.email
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {"•".repeat(8)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(user.role) ? (
                                user.role.map((roleKey) => (
                                  <Badge
                                    key={roleKey}
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                  >
                                    {roleMap[roleKey as RoleKey].label}
                                  </Badge>
                                ))
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {roleMap[user.role as RoleKey].label}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {editingId === user.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      saveEdit(user.id, editingValues)
                                    }
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SectionWrapper>
    </AccessGuard>
  );
}
