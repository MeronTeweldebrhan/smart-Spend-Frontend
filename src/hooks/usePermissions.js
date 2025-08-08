// In your AuthContext or a new permissions hook
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

export const usePermissions = () => {
    const { user, activeAccountId, accounts } = useContext(AuthContext);

    const hasPermission = (permissionKey) => {
        if (!user || !activeAccountId|| !accounts) return false;

        // Find the active account from the list
        const activeAccount = accounts.find(acc => acc._id === activeAccountId);
        if (!activeAccount) return false;

        // Check if the current user is the owner
        if (activeAccount.owner._id === user._id) {
            return true; // Owner has all permissions
        }

        // Check if the current user is an employee and has the specific permission
        const employeeEntry = activeAccount.employeeUsers.find(
            emp => emp.user._id === user._id
        );

        if (employeeEntry) {
            return employeeEntry.permissions[permissionKey];
        }
        
        return false;
    };

    return { hasPermission };
};