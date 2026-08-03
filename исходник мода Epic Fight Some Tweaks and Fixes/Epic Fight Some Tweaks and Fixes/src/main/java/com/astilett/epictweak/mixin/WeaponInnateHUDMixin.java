package com.astilett.epictweak.mixin;

import net.minecraft.ChatFormatting;
import net.minecraft.network.chat.Component;
import net.minecraft.network.chat.MutableComponent;
import net.minecraft.network.chat.contents.TranslatableContents;
import net.minecraft.world.item.ItemStack;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import yesman.epicfight.api.animation.property.AnimationProperty.AttackPhaseProperty;
import yesman.epicfight.skill.weaponinnate.EviscerateSkill;
import yesman.epicfight.skill.weaponinnate.WeaponInnateSkill;
import yesman.epicfight.world.capabilities.entitypatch.player.PlayerPatch;
import yesman.epicfight.world.capabilities.item.CapabilityItem;

import java.util.List;
import java.util.Map;

@Mixin(value = WeaponInnateSkill.class, remap = false)
public abstract class WeaponInnateHUDMixin {

    /**
     * Убираем модификатор бронепробития навыка – теперь всегда показывается значение из оружия.
     */
    @Inject(method = "generateTooltipforPhase", at = @At("HEAD"), remap = false)
    private void removeArmorNegationFromTooltip(List<Component> list, ItemStack itemstack, CapabilityItem itemcap,
                                                PlayerPatch<?> playerpatch, Map<AttackPhaseProperty<?>, Object> propertyMap,
                                                String title, CallbackInfo ci) {
        propertyMap.remove(AttackPhaseProperty.ARMOR_NEGATION_MODIFIER);
    }

    /**
     * Для EviscerateSkill (кинжалы) во второй фазе ("Second Strike:") заменяем урон на ∞, а impact на "-".
     */
    @Inject(method = "generateTooltipforPhase", at = @At("RETURN"), remap = false)
    private void replaceEviscerateSecondStrikeDamage(List<Component> list, ItemStack itemstack, CapabilityItem itemcap,
                                                     PlayerPatch<?> playerpatch, Map<AttackPhaseProperty<?>, Object> propertyMap,
                                                     String title, CallbackInfo ci) {
        if (!((Object) this instanceof EviscerateSkill)) return;
        if (!"Second Strike:".equals(title)) return;

        // Замена урона на ∞
        for (int i = 0; i < list.size(); i++) {
            Component comp = list.get(i);

            if (comp.getContents() instanceof TranslatableContents translatable && "damage_source.epicfight.damage".equals(translatable.getKey())) {
                MutableComponent infiniteDamage = Component.literal("∞ ")
                        .withStyle(ChatFormatting.RED)
                        .append(Component.translatable("damage_source.epicfight.damage",
                                Component.literal("∞").withStyle(ChatFormatting.RED)));
                list.set(i, infiniteDamage.withStyle(ChatFormatting.DARK_GRAY));
                break;
            }
        }

        // Замена impact на "-"
        for (int i = 0; i < list.size(); i++) {
            Component comp = list.get(i);
            if (comp.getContents() instanceof TranslatableContents translatable && translatable.getKey() != null && translatable.getKey().contains("impact")) {
                MutableComponent dash = Component.literal("-").withStyle(ChatFormatting.AQUA);
                list.set(i, dash.withStyle(ChatFormatting.DARK_GRAY));
                break;
            }
        }
    }
}