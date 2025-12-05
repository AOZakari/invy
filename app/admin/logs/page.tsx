import { supabaseAdmin } from '@/lib/supabase/server';
import type { ErrorLog, EmailLog } from '@/types/database';

async function getLogs() {
  const [errorLogsResult, emailLogsResult] = await Promise.all([
    supabaseAdmin
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
    supabaseAdmin
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  return {
    errorLogs: (errorLogsResult.data || []) as ErrorLog[],
    emailLogs: (emailLogsResult.data || []) as EmailLog[],
  };
}

export default async function AdminLogsPage() {
  const { errorLogs, emailLogs } = await getLogs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Logs</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Error and email delivery logs
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Error Logs</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Level</th>
                    <th className="text-left py-3 px-4 font-medium">Message</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {errorLogs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 px-4 text-center text-gray-500">
                        No error logs
                      </td>
                    </tr>
                  ) : (
                    errorLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.level === 'error'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800'
                                : log.level === 'warn'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800'
                            }`}
                          >
                            {log.level.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">{log.message}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Email Logs</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">To</th>
                    <th className="text-left py-3 px-4 font-medium">Subject</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                        No email logs
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="py-3 px-4">{log.to_email}</td>
                        <td className="py-3 px-4">{log.subject}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.status === 'sent'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800'
                                : log.status === 'failed'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800'
                            }`}
                          >
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

