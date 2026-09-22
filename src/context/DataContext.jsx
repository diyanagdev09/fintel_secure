import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Papa from 'papaparse';

import {
  uploadsApi,
} from '../api/client.js';

import {
  useAuth,
} from './AuthContext.jsx';


const DataContext =
  createContext(null);


/* =========================================================
   HELPERS
========================================================= */

const numeric = (
  value
) => {
  if (
    value == null ||
    value === ''
  ) {
    return null;
  }

  const number =
    Number(
      String(value)
        .replace(
          /[,₹$%]/g,
          ''
        )
    );

  return Number.isFinite(
    number
  )
    ? number
    : null;
};


const enrich = (
  upload
) => {
  const rows =
    upload.rows || [];

  const headers =
    upload.headers || [];

  const amount =
    upload.numericField ||
    headers.find(
      (header) =>
        /(amount|price|value|total|debit|credit|cost|salary|balance)/i.test(
          header
        )
    );

  const category =
    upload.categoryField ||
    headers.find(
      (header) =>
        /(category|type|merchant|sector|class)/i.test(
          header
        )
    );

  const date =
    upload.dateField ||
    headers.find(
      (header) =>
        /(date|time|timestamp)/i.test(
          header
        )
    );


  const values =
    rows
      .map(
        (row) =>
          numeric(
            amount
              ? row[amount]
              : null
          )
      )
      .filter(
        (value) =>
          value != null
      );


  const categoryMap =
    {};

  if (category) {
    rows.forEach(
      (row) => {
        const key =
          String(
            row[category] ??
              'Unknown'
          );

        categoryMap[key] =
          (categoryMap[key] ||
            0) + 1;
      }
    );
  }


  const dateMap =
    {};

  if (date) {
    rows.forEach(
      (row) => {
        const parsed =
          new Date(
            row[date]
          );

        if (
          !Number.isNaN(
            parsed.valueOf()
          )
        ) {
          const key =
            parsed
              .toISOString()
              .slice(
                0,
                10
              );

          dateMap[key] =
            (dateMap[key] ||
              0) + 1;
        }
      }
    );
  }


  const sortedDates =
    Object.keys(
      dateMap
    ).sort();


  return {
    ...upload,

    id: String(
      upload._id ||
        upload.id
    ),

    name:
      upload.filename ||
      upload.name,

    totalTransactions:
      rows.length,

    averageValue:
      values.length
        ? Number(
            (
              values.reduce(
                (
                  total,
                  value
                ) =>
                  total +
                  value,
                0
              ) /
              values.length
            ).toFixed(2)
          )
        : null,

    numericField:
      amount,

    categoryField:
      category,

    dateField:
      date,

    categoryCounts:
      Object.keys(
        categoryMap
      ).length
        ? {
            labels:
              Object.keys(
                categoryMap
              ),

            values:
              Object.values(
                categoryMap
              ),
          }
        : null,

    dateTrend:
      sortedDates.length
        ? {
            labels:
              sortedDates,

            values:
              sortedDates.map(
                (key) =>
                  dateMap[key]
              ),
          }
        : null,
  };
};


/* =========================================================
   PROVIDER
========================================================= */

export function DataProvider({
  children,
}) {
  const {
    currentUser,
    authReady,
  } = useAuth();

  const [
    files,
    setFiles,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);


  /* =====================================================
     LOAD FROM DATABASE
  ===================================================== */

  const load =
    useCallback(
      async () => {
        if (
          !authReady ||
          !currentUser
        ) {
          return;
        }

        setLoading(true);

        try {
          const result =
            await uploadsApi.list();

          /*
           * Only replace state when the server
           * actually returned an uploads array.
           */
          if (
            Array.isArray(
              result?.uploads
            )
          ) {
            setFiles(
              result.uploads.map(
                enrich
              )
            );
          }
        } catch (error) {
          /*
           * IMPORTANT:
           * Never erase existing datasets because
           * the request temporarily failed.
           */
          console.error(
            'Unable to reload datasets:',
            error
          );
        } finally {
          setLoading(false);
        }
      },
      [
        authReady,
        currentUser,
      ]
    );


  /*
   * Load every time authentication becomes
   * ready for a logged-in user.
   */
  useEffect(() => {
    if (
      authReady &&
      currentUser
    ) {
      load();
    }
  }, [
    authReady,
    currentUser,
    load,
  ]);


  /* =====================================================
     ADD FILES
  ===================================================== */

  const addFiles =
    useCallback(
      async (
        selected
      ) => {
        const result =
          await uploadsApi.create(
            selected
          );

        const mapped =
          (
            result.uploads ||
            []
          ).map(
            enrich
          );

        setFiles(
          (current) => [
            ...mapped,
            ...current,
          ]
        );

        return mapped;
      },
      []
    );


  /* =====================================================
     DELETE
  ===================================================== */

  const deleteFile =
    useCallback(
      async (
        id
      ) => {
        const result =
          await uploadsApi.delete(
            id
          );

        if (
          result?.deleted
        ) {
          setFiles(
            (current) =>
              current.filter(
                (file) =>
                  String(
                    file.id
                  ) !==
                  String(id)
              )
          );
        }

        return result;
      },
      []
    );


  /* =====================================================
     REVIEW
  ===================================================== */

  const updateReview =
    useCallback(
      async (
        uploadId,
        index,
        status,
        note = ''
      ) => {
        const result =
          await uploadsApi.review(
            uploadId,
            index,
            status,
            note
          );

        const mapped =
          enrich(
            result.upload
          );

        setFiles(
          (current) =>
            current.map(
              (file) =>
                String(
                  file.id
                ) ===
                String(
                  mapped.id
                )
                  ? mapped
                  : file
            )
        );

        return mapped;
      },
      []
    );


  /* =====================================================
     LOCAL CSV PREVIEW
  ===================================================== */

  const localParse =
    useCallback(
      (file) =>
        new Promise(
          (
            resolve,
            reject
          ) => {
            Papa.parse(
              file,
              {
                header: true,
                skipEmptyLines:
                  true,

                complete:
                  (
                    result
                  ) => {
                    if (
                      result.errors
                        ?.length
                    ) {
                      reject(
                        new Error(
                          'Unable to preview CSV.'
                        )
                      );

                      return;
                    }

                    resolve(
                      result.data
                    );
                  },

                error:
                  reject,
              }
            );
          }
        ),
      []
    );


  const value =
    useMemo(
      () => ({
        files,
        loading,

        load,
        addFiles,
        deleteFile,
        updateReview,
        localParse,
      }),
      [
        files,
        loading,
        load,
        addFiles,
        deleteFile,
        updateReview,
        localParse,
      ]
    );


  return (
    <DataContext.Provider
      value={value}
    >
      {children}
    </DataContext.Provider>
  );
}


export const useData =
  () => {
    const context =
      useContext(
        DataContext
      );

    if (!context) {
      throw new Error(
        'useData must be used within DataProvider'
      );
    }

    return context;
  };