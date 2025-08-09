
import ChartofAccountsForm from "../../components/ChartofAcoountForm.jsx";
import { useAuth } from "../../Context/useAuth.js";
import ChartofAccountTable from "../../components/ChartofAccoutsTabel.jsx";
function ChartAccountsPage(){
 const { activeAccountId } = useAuth();
    return(
        <div>
        {activeAccountId && <ChartofAccountsForm accountId={activeAccountId} />}
        {activeAccountId && <ChartofAccountTable accountId={activeAccountId}/>}
        </div>
    )
}

export default ChartAccountsPage