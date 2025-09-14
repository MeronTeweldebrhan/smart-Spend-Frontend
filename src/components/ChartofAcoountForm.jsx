import { useState, useEffect } from "react";
import backendClient from "../Clients/backendClient.js";
import { useAuth } from "../Context/useAuth.js";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";

export default function ChartOfAccountsForm({ onAccountCreated }) {
  const { activeAccountId } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    subtype: "",
    description: "",
  });
  const [subTypes, setSubTypes] = useState([]);
  const [isAddingSubType, setIsAddingSubType] = useState(false);
  const [newSubTypeName, setNewSubTypeName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubTypes = async () => {
      if (!activeAccountId || !formData.type) {
        setSubTypes([]);
        return;
      }
      try {
        const res = await backendClient.get("/chartofaccounts/subtypes", {
          params: { accountId: activeAccountId, type: formData.type },
        });
        setSubTypes(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load subtypes.");
      }
    };
    fetchSubTypes();
  }, [activeAccountId, formData.type]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddSubType = async () => {
    if (!newSubTypeName || !formData.type) {
      setError("Subtype name and type are required.");
      return;
    }
    try {
      const res = await backendClient.post("/chartofaccounts/subtypes", {
        name: newSubTypeName,
        type: formData.type,
        accountId: activeAccountId,
      });
      setSubTypes([...subTypes, res.data]);
      setNewSubTypeName("");
      setIsAddingSubType(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add subtype.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !activeAccountId) {
      setError("Name, type, and active account required.");
      return;
    }
    try {
      await backendClient.post("/chartofaccounts", {
        ...formData,
        accountId: activeAccountId,
      });
      setFormData({ name: "", type: "", subtype: "", description: "" });
      onAccountCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account.");
    }
  };

  return (
    <CardContent className="p-6 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Add Chart of Account</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Account name"
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            name="type"
            value={formData.type}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, type: v, subtype: "" }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asset">Asset</SelectItem>
              <SelectItem value="Liability">Liability</SelectItem>
              <SelectItem value="Equity">Equity</SelectItem>
              <SelectItem value="Revenue">Revenue</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subtype">Subtype</Label>
          <div className="flex gap-2">
            <Select
              name="subtype"
              value={formData.subtype}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, subtype: v }))
              }
              disabled={!formData.type}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Subtype" />
              </SelectTrigger>
              <SelectContent>
                {subTypes.length > 0 && subTypes.some((st) => st.type === formData.type) ? (
                  subTypes
                    .filter((st) => st.type === formData.type)
                    .map((st) => (
                      <SelectItem key={st._id} value={st._id}>
                        {st.name}
                      </SelectItem>
                    ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    No subtypes available
                  </div>
                )}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingSubType(true)}
            >
              +
            </Button>
          </div>
          {isAddingSubType && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="New subtype"
                value={newSubTypeName}
                onChange={(e) => setNewSubTypeName(e.target.value)}
              />
              <Button size="sm" onClick={handleAddSubType}>
                Add
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setIsAddingSubType(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            rows={4}
          />
        </div>

        <Button type="submit" className="w-full">
          Add Account
        </Button>
      </form>
    </CardContent>
  );
}