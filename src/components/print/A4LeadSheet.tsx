import React from 'react';
import { FollowUp, Lead } from '../../types';
import { formatDate } from '../../services/storage';

interface A4LeadSheetProps {
  lead: Lead;
  followUps?: FollowUp[];
  printDate?: string;
}

export const A4LeadSheet: React.FC<A4LeadSheetProps> = ({
  lead,
  followUps = [],
  printDate,
}) => {
  const todayFormatted = printDate || formatDate(new Date().toISOString().split('T')[0]);

  // Sort follow-ups by followUpNumber ascending
  const sortedFollowUps = [...followUps].sort(
    (a, b) => a.followUpNumber - b.followUpNumber
  );

  // We need exactly 8 rows in the table. If there are fewer than 8, we pad with empty rows.
  // If there are more than 8, we display the last 8 or all, but user requested 8 visible rows initially.
  const displayFollowUps: Array<FollowUp | null> = [];
  for (let i = 0; i < 8; i++) {
    displayFollowUps.push(sortedFollowUps[i] || null);
  }

  const formatCurrency = (val?: number) => {
    if (!val) return '-';
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹ ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="a4-sheet bg-white text-black text-[11px] leading-tight font-sans mx-auto p-6 border border-slate-300 shadow-sm print:p-0 print:border-0 print:shadow-none print:w-full box-border max-w-[210mm] min-h-[296mm] flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-3">
          <div className="w-24"></div>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold tracking-wider uppercase text-black">
              CUSTOMER LEAD PROFILE
            </h1>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-0.5">
              Confidential Client Record Sheet
            </p>
          </div>
          <div className="text-right text-[10px] text-gray-700 w-28">
            <div><span className="font-semibold">Print Date:</span> {todayFormatted}</div>
            <div><span className="font-semibold">Page:</span> 1 of 1</div>
          </div>
        </div>

        {/* Lead Identification Bar */}
        <div className="grid grid-cols-6 border border-black bg-gray-50 text-[10.5px] mb-3 text-center divide-x divide-black">
          <div className="p-1.5">
            <div className="text-[9px] uppercase font-bold text-gray-600">Lead ID</div>
            <div className="font-bold text-black text-[12px]">{lead.leadId}</div>
          </div>
          <div className="p-1.5">
            <div className="text-[9px] uppercase font-bold text-gray-600">Lead Date</div>
            <div className="font-semibold text-black">{formatDate(lead.leadDate)}</div>
          </div>
          <div className="p-1.5">
            <div className="text-[9px] uppercase font-bold text-gray-600">Lead Source</div>
            <div className="font-semibold text-black">{lead.leadSource || '-'}</div>
          </div>
          <div className="p-1.5">
            <div className="text-[9px] uppercase font-bold text-gray-600">Interested Project</div>
            <div className="font-bold text-black">{lead.interestedProject || '-'}</div>
          </div>
          <div className="p-1.5">
            <div className="text-[9px] uppercase font-bold text-gray-600">Lead Status</div>
            <div className="font-semibold text-black">{lead.status}</div>
          </div>
          <div className="p-1.5">
            <div className="text-[9px] uppercase font-bold text-gray-600">Priority</div>
            <div className="font-bold text-black uppercase tracking-wider">{lead.priority}</div>
          </div>
        </div>

        {/* 3-Column Section: Customer Details | Address Details | Sales Executive Details */}
        <div className="grid grid-cols-12 border border-black divide-x divide-black mb-3">
          {/* Col 1: Customer Details (5 cols) */}
          <div className="col-span-5 p-2 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-1.5 text-gray-800">
                1. Customer Details
              </div>
              <table className="w-full text-[10.5px]">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-0.5 font-semibold text-gray-700 w-24">Customer Name:</td>
                    <td className="py-0.5 font-bold text-black text-[11.5px]">
                      {lead.customerDetails.name}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-0.5 font-semibold text-gray-700">Mobile No:</td>
                    <td className="py-0.5 font-bold text-black tracking-wide">
                      {lead.customerDetails.mobile}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-0.5 font-semibold text-gray-700">Alternate No:</td>
                    <td className="py-0.5 text-black">
                      {lead.customerDetails.altMobile || '-'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-0.5 font-semibold text-gray-700">WhatsApp No:</td>
                    <td className="py-0.5 text-black">
                      {lead.customerDetails.whatsapp || lead.customerDetails.mobile}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-0.5 font-semibold text-gray-700">Email:</td>
                    <td className="py-0.5 text-black break-all">
                      {lead.customerDetails.email || '-'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-0.5 font-semibold text-gray-700">Date of Birth:</td>
                    <td className="py-0.5 text-black">
                      {formatDate(lead.customerDetails.dob)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-0.5 font-semibold text-gray-700">Occupation:</td>
                    <td className="py-0.5 text-black">
                      {lead.customerDetails.occupation || '-'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-0.5 font-semibold text-gray-700">Company:</td>
                    <td className="py-0.5 text-black">
                      {lead.customerDetails.companyName || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-semibold text-gray-700">Customer Type:</td>
                    <td className="py-0.5 font-semibold text-black">
                      {lead.customerDetails.customerType || 'Salaried'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Col 2: Address Details (4 cols) */}
          <div className="col-span-4 p-2 bg-white flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-1.5 text-gray-800">
                2. Address Details
              </div>
              <div className="mb-2">
                <div className="text-[9.5px] font-bold text-gray-700 underline">Residential:</div>
                <div className="text-[10px] text-black mt-0.5">
                  {lead.residentialAddress.address || '-'}
                </div>
                <div className="text-[10px] text-black">
                  {[
                    lead.residentialAddress.area,
                    lead.residentialAddress.city,
                    lead.residentialAddress.state,
                    lead.residentialAddress.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-1.5">
                <div className="text-[9.5px] font-bold text-gray-700 underline">Work / Business:</div>
                <div className="text-[10px] font-semibold text-black mt-0.5">
                  {lead.workAddress.company || '-'}
                </div>
                <div className="text-[10px] text-black">
                  {lead.workAddress.workAddress || '-'}
                </div>
                <div className="text-[10px] text-black">
                  {[
                    lead.workAddress.workArea,
                    lead.workAddress.city,
                    lead.workAddress.state,
                    lead.workAddress.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </div>
                {lead.workAddress.designation && (
                  <div className="text-[9.5px] text-gray-700 mt-0.5">
                    <span className="font-semibold">Designation:</span> {lead.workAddress.designation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Col 3: Sales Executive Details (3 cols) */}
          <div className="col-span-3 p-2 bg-gray-50 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-1.5 text-gray-800">
                3. Assignment
              </div>
              <div className="space-y-2 mt-1">
                <div>
                  <div className="text-[9px] uppercase font-bold text-gray-600">Assigned Team:</div>
                  <div className="font-bold text-[12px] text-black">{lead.teamName || 'Unassigned'}</div>
                </div>
                <div className="bg-white p-2 border border-black rounded">
                  <div className="text-[9px] uppercase font-bold text-gray-600">Sales Executive:</div>
                  <div className="font-bold text-[13px] text-black tracking-wide mt-0.5">
                    {lead.executiveName || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-gray-600">Assigned Date:</div>
                  <div className="font-semibold text-black">{formatDate(lead.assignedDate)}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-gray-600">First Contact:</div>
                  <div className="text-[10px] text-black">
                    {lead.initialContact.modeOfContact} ({formatDate(lead.initialContact.firstContactDate)})
                  </div>
                  {lead.initialContact.referredBy && (
                    <div className="text-[9.5px] text-gray-600 mt-0.5">
                      Ref: {lead.initialContact.referredBy}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Section Grid: Property Requirement & Financial Profile */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Property Requirement */}
          <div className="border border-black p-2 bg-white">
            <div className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-1.5 text-gray-800">
              4. Property Requirement
            </div>
            <table className="w-full text-[10px]">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700 w-28">Requirement Type:</td>
                  <td className="py-0.5 font-bold text-black">{lead.propertyRequirement.requirementType}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Preferred Unit:</td>
                  <td className="py-0.5 font-bold text-black">{lead.propertyRequirement.preferredUnit || '-'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Interested Project:</td>
                  <td className="py-0.5 text-black">{lead.propertyRequirement.interestedProject || '-'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Preferred Location:</td>
                  <td className="py-0.5 text-black">{lead.propertyRequirement.preferredLocation || 'Any'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Budget Range:</td>
                  <td className="py-0.5 font-semibold text-black">
                    {formatCurrency(lead.propertyRequirement.minBudget)} – {formatCurrency(lead.propertyRequirement.maxBudget)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Size Requirement:</td>
                  <td className="py-0.5 text-black">
                    {lead.propertyRequirement.minSize || '-'} to {lead.propertyRequirement.maxSize || '-'} sq.ft
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 font-semibold text-gray-700">Purchase Timeline:</td>
                  <td className="py-0.5 font-bold text-black">{lead.propertyRequirement.purchaseTimeline}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Profile */}
          <div className="border border-black p-2 bg-white">
            <div className="text-[10px] font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-1.5 text-gray-800">
              5. Financial / Purchase Profile
            </div>
            <table className="w-full text-[10px]">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700 w-32">Approximate Budget:</td>
                  <td className="py-0.5 font-bold text-black">
                    {formatCurrency(lead.financialProfile.approxBudget)}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Funding Type:</td>
                  <td className="py-0.5 font-bold text-black">{lead.financialProfile.fundingType}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Existing Property:</td>
                  <td className="py-0.5 text-black">{lead.financialProfile.existingProperty || 'None'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Selling Existing Property:</td>
                  <td className="py-0.5 text-black">{lead.financialProfile.sellingExistingProperty || 'No'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Investment Purpose:</td>
                  <td className="py-0.5 text-black">{lead.financialProfile.investmentPurpose || '-'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Decision Maker:</td>
                  <td className="py-0.5 text-black">{lead.financialProfile.decisionMaker || 'Self'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-0.5 font-semibold text-gray-700">Family Involvement:</td>
                  <td className="py-0.5 text-black">{lead.financialProfile.familyInvolvement || 'Medium'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-semibold text-gray-700">Purchase Urgency:</td>
                  <td className="py-0.5 font-bold text-black">{lead.financialProfile.purchaseUrgency || 'Normal'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Follow-up Area - PRIORITY (8 Entries with generous handwriting space) */}
        <div className="mb-3 avoid-break">
          <div className="flex justify-between items-center bg-gray-100 border border-black border-b-0 px-2 py-1">
            <span className="font-bold text-[10.5px] uppercase tracking-wider text-black">
              FOLLOW-UP HISTORY (8 ENTRIES)
            </span>
            <span className="text-[9.5px] text-gray-600 italic">
              Maintain chronological follow-up entries with remarks and next date
            </span>
          </div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-gray-50 border-b border-black text-center font-bold text-[9.5px] uppercase">
                <th className="border border-black py-1 px-1 w-8">No.</th>
                <th className="border border-black py-1 px-1.5 w-20">Date</th>
                <th className="border border-black py-1 px-2 text-left">Remark / Discussion Points</th>
                <th className="border border-black py-1 px-1.5 w-28">Mode of Contact</th>
                <th className="border border-black py-1 px-1.5 w-24">Next Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {displayFollowUps.map((item, index) => {
                const rowNo = index + 1;
                return (
                  <tr key={rowNo} className="border-b border-black">
                    <td className="border border-black text-center py-2 font-bold bg-gray-50">
                      {rowNo}
                    </td>
                    <td className="border border-black text-center py-2 font-semibold">
                      {item ? formatDate(item.date) : ''}
                    </td>
                    <td className="border border-black px-2 py-2 text-left font-normal align-top leading-snug min-h-[32px]">
                      {item ? (
                        <span>{item.remark}</span>
                      ) : (
                        <div className="h-5"></div>
                      )}
                    </td>
                    <td className="border border-black text-center py-2">
                      {item ? item.modeOfContact : ''}
                    </td>
                    <td className="border border-black text-center py-2 font-bold">
                      {item ? formatDate(item.nextFollowUpDate) : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Management Notes (blank ruled space for office handwriting or notes) */}
        <div className="border border-black p-2 bg-white mb-3 avoid-break">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800 mb-1">
            MANAGEMENT NOTES / OBSERVATIONS
          </div>
          <div className="text-[10px] text-gray-800 min-h-[46px] border-b border-gray-300 pb-1 mb-1">
            {lead.managementNotes ? (
              <p className="italic font-medium">{lead.managementNotes}</p>
            ) : null}
          </div>
          <div className="border-b border-gray-300 h-5"></div>
          <div className="border-b border-gray-300 h-5"></div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="border-t-2 border-black pt-3 pb-1 text-[10px] font-semibold text-gray-800 avoid-break">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-gray-600 mb-6">Prepared By: ___________________</div>
            <div className="text-gray-500 text-[9px]">Sales Coordinator / Executive</div>
          </div>
          <div>
            <div className="text-gray-600 mb-6">Date: ___________________</div>
            <div className="text-gray-500 text-[9px]">File Initiation Date</div>
          </div>
          <div>
            <div className="text-gray-600 mb-6">Checked By: ___________________</div>
            <div className="text-gray-500 text-[9px]">Team Leader / Manager</div>
          </div>
          <div>
            <div className="text-gray-600 mb-6">Date: ___________________</div>
            <div className="text-gray-500 text-[9px]">Verification Date</div>
          </div>
        </div>
      </div>
    </div>
  );
};
