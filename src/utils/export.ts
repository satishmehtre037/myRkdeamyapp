/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 *
 * @param data Array of objects representing the rows.
 * @param filename The desired filename (e.g., "students.csv").
 * @param columns Array of objects defining the column headers and matching data keys.
 */
export function downloadCSV<T>(
  data: T[],
  filename: string,
  columns: { header: string; key: keyof T | ((row: T) => string | number) }[]
) {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  // 1. Build the Header Row
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');

  // 2. Build the Data Rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let value: any = '';
        if (typeof col.key === 'function') {
          value = col.key(row);
        } else {
          value = row[col.key];
        }

        // Handle null/undefined
        if (value === null || value === undefined) {
          value = '';
        }
        
        // Escape quotes and wrap in quotes to handle commas inside the data
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(',');
  });

  // 3. Combine Header and Rows
  const csvContent = [headers, ...rows].join('\n');

  // 4. Create Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
