// nativeApp\src\features\party\components\party-form-sheet.tsx

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Field, FormButton, Input } from "@/components/ui/form";
import type { IParty, NewParty, PartyType } from "@/features/khata/types";
import { PartyTypeToggle } from "@/features/party/components/party-type-toggle";
import { type PartyFormValues, partySchema } from "@/features/party/schemas";

type Props = {
    visible: boolean;
    party?: IParty; // pass to switch into EDIT mode
    defaultType?: PartyType;
    onClose: () => void;
    onSaved: (v: NewParty) => void;
};

export function PartyFormSheet({ visible, party, defaultType = "customer", onClose, onSaved }: Props) {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<PartyFormValues>({
        resolver: zodResolver(partySchema),
        defaultValues: { name: "", phone: "", type: defaultType },
    });

    useEffect(() => {
        if (!visible) return;
        reset(
            party
                ? { name: party.name, phone: party.phone ?? "", type: party.type }
                : { name: "", phone: "", type: defaultType },
        );
    }, [visible, party, defaultType, reset]);

    const submit = (v: PartyFormValues) => {
        onSaved({ name: v.name, phone: v.phone || undefined, type: v.type });
        onClose();
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title={party ? "Party Edit Karein" : "Nayi Party Add Karein"}
            subtitle="Customer ya supplier ki detail likhein"
            footer={
                <FormButton
                    label={party ? "Tabdeeliyan Save Karein" : "Party Save Karein"}
                    onPress={handleSubmit(submit)}
                />
            }>
            <Field label="Party ka naam" required error={errors.name?.message}>
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { value, onChange, onBlur } }) => (
                        <Input
                            icon={{ ios: "person", android: "person", web: "person" }}
                            placeholder="jaise: Ali Ashraf"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            autoCorrect={false}
                        />
                    )}
                />
            </Field>

            <Field
                label="Phone number"
                hint="Optional. WhatsApp/SMS reminder ke liye zaroori hai"
                error={errors.phone?.message}>
                <Controller
                    control={control}
                    name="phone"
                    render={({ field: { value, onChange, onBlur } }) => (
                        <Input
                            icon={{ ios: "phone", android: "call", web: "call" }}
                            placeholder="03001234567"
                            keyboardType="phone-pad"
                            value={value ?? ""}
                            onChangeText={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />
            </Field>

            <Field label="Party ki qism">
                <Controller
                    control={control}
                    name="type"
                    render={({ field: { value, onChange } }) => (
                        <PartyTypeToggle value={value} onChange={onChange} showHints />
                    )}
                />
            </Field>

            {/* <FormButton
                label={party ? "Tabdeeliyan Save Karein" : "Party Save Karein"}
                onPress={handleSubmit(submit)}
            /> */}
        </BottomSheet>
    );
}