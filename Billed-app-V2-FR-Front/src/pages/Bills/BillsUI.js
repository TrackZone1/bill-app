import VerticalLayout from "../../components/VerticalLayout.js";
import ErrorPage from "../../components/ErrorPage.js";
import LoadingPage from "../../components/LoadingPage.js";

import Actions from "../../components/Actions.js";

const row = (bill) => {
    return `
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `;
};

const compareByDateDesc = (a, b) => {
    const dateA = Date.parse(a.date);
    const dateB = Date.parse(b.date);

    if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
        return dateB - dateA;
    }

    // Fallback string comparison when dates are not parseable
    return a.date < b.date ? 1 : -1;
};

const rows = (data) => {
    if (!data || !data.length) return "";

    const sortedBills = [...data].sort(compareByDateDesc);
    return sortedBills.map((bill) => row(bill)).join("");
};

export default ({ data: bills, loading, error }) => {
    const modal = () => `
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `;

    if (loading) {
        return LoadingPage();
    } else if (error) {
        return ErrorPage(error);
    }

    return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;
};
