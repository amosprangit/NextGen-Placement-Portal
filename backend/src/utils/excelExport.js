const ExcelJS = require('exceljs');

/**
 * Builds an .xlsx workbook (as a Buffer) listing every applicant for a
 * drive, with the columns the placement cell actually needs to act on:
 * contact details, academic record, resume link, and where they are in
 * the process.
 */
const buildApplicantsWorkbook = async (drive, applications) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NextGen CareerConnect';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Applicants', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Roll Number', key: 'rollNumber', width: 16 },
    { header: 'Branch', key: 'branch', width: 20 },
    { header: 'Batch', key: 'batch', width: 10 },
    { header: 'CGPA', key: 'cgpa', width: 10 },
    { header: 'Backlogs', key: 'backlogs', width: 10 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Attendance', key: 'attendance', width: 14 },
    { header: 'Interview Given', key: 'interviewGiven', width: 16 },
    { header: 'Applied On', key: 'appliedOn', width: 16 },
    { header: 'Resume URL', key: 'resumeUrl', width: 40 },
  ];
  sheet.getRow(1).font = { bold: true };

  applications.forEach((a) => {
    sheet.addRow({
      name: a.student?.user?.name || '',
      email: a.student?.user?.email || '',
      phone: a.student?.phone || '',
      rollNumber: a.student?.rollNumber || '',
      branch: a.student?.branch || '',
      batch: a.student?.batch || '',
      cgpa: a.student?.cgpa ?? '',
      backlogs: a.student?.backlogs ?? '',
      status: a.status,
      attendance: a.attendance,
      interviewGiven: a.interviewGiven ? 'Yes' : 'No',
      appliedOn: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '',
      resumeUrl: a.resumeUrlSnapshot || '',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `${(drive.company || 'drive').replace(/[^a-z0-9]/gi, '-')}-applicants.xlsx`;
  return { buffer, filename };
};

module.exports = { buildApplicantsWorkbook };
