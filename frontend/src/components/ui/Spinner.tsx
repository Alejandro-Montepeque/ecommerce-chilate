import { useTranslation } from "react-i18next";

// Indicador de carga reutilizable.
export function Spinner() {
  const { t } = useTranslation();
  return (
    <p className="text-gray-500 py-8 text-center">{t("common.loading")}</p>
  );
}
