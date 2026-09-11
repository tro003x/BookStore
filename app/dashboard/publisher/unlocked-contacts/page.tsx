import UnlockedContacts from '@/components/dashboard/UnlockedContacts';

export default function PublisherUnlockedContactsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-['Fraunces'] text-2xl font-semibold text-[#0C0A00]">
          Unlocked Contacts
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Contacts you have unlocked from the directory
        </p>
      </div>
      <UnlockedContacts />
    </div>
  );
}