/**
 * تحويل مصفوفة من الكائنات (Objects) إلى نص بصيغة CSV بشكل ديناميكي
 * @param {Array} data - مصفوفة البيانات المراد تصديرها
 * @returns {String} - النص الجاهز للتصدير كملف CSV
 */
const convertToCSV = (data = []) => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // 1. استخراج أسماء الأعمدة (Headers) تلقائياً من مفاتيح أول كائن
  const headers = Object.keys(data[0]);

  // 2. بناء السطر الأول (العناوين)
  const csvRows = [headers.join(',')];

  // 3. تحويل كل كائن إلى سطر مفصول بفواصل
  for (const row of data) {
    const values = headers.map(header => {
      let value = row[header];

      // إذا كانت القيمة فارغة أو غير معرفة
      if (value === null || value === undefined) {
        value = '';
      }
      // إذا كانت القيمة مصفوفة أو كائن (مثل تصنيفات الميديا Genres المدمجة في استعلامك)
      else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } 
      // إذا كانت القيمة نصية، نحولها لنص صريح
      else {
        value = String(value);
      }

      // حماية ملف الـ CSV: لو النص يحتوي على فواصل أو سطر جديد، يجب تغليفه بعلامات تنصيص ""
      // ومضاعفة علامات التنصيص الداخلية لكي لا ينكسر ملف الـ Excel
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }

      return value;
    });

    csvRows.push(values.join(','));
  }

  // 4. دمج كل السطور مع إضافة سطر جديد ونقل البيانات بترميز UTF-8
  // إضافة BOM (\ufeff) في بداية الملف لتجبر برنامج Excel على قراءة الحروف العربية بشكل صحيح دون رموز غريبة
  return '\ufeff' + csvRows.join('\n');
};

module.exports = {
  convertToCSV
};
