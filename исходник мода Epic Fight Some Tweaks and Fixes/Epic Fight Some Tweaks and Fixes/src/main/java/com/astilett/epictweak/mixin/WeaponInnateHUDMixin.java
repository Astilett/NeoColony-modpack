package com.astilett.epictweak.mixin;

import net.minecraft.network.chat.Component;
import net.minecraft.world.item.ItemStack;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import yesman.epicfight.api.animation.property.AnimationProperty.AttackPhaseProperty;
import yesman.epicfight.skill.weaponinnate.WeaponInnateSkill;
import yesman.epicfight.world.capabilities.entitypatch.player.PlayerPatch;
import yesman.epicfight.world.capabilities.item.CapabilityItem;
import java.util.List;
import java.util.Map;

@Mixin(value = WeaponInnateSkill.class, remap = false)
public abstract class WeaponInnateHUDMixin {

    /**
     * Перед генерацией тултипа удаляем только модификатор бронепробития навыка,
     * чтобы показывалось базовое значение из CapabilityItem.
     * Модификаторы урона и impact оставляем – они будут учтены в расчёте.
     */
    @Inject(method = "generateTooltipforPhase", at = @At("HEAD"), remap = false)
    private void removeArmorNegationFromTooltip(List<Component> list, ItemStack itemstack, CapabilityItem itemcap,
                                                PlayerPatch<?> playerpatch, Map<AttackPhaseProperty<?>, Object> propertyMap,
                                                String title, CallbackInfo ci) {
        // Убираем из описания только фиксированное бронепробитие навыка
        propertyMap.remove(AttackPhaseProperty.ARMOR_NEGATION_MODIFIER);
        // Остальные модификаторы (урон, impact) остаются в карте и будут применены к базовым значениям
    }
}