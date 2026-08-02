package com.astilett.epictweak;

import net.minecraft.nbt.CompoundTag;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.item.ItemStack;
import net.minecraftforge.event.entity.player.PlayerEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.ModList;
import net.minecraftforge.fml.common.Mod;
import vazkii.patchouli.api.PatchouliAPI;

@Mod.EventBusSubscriber(modid = "epictweak")
public class BookEventHandler {

    private static final String TAG_RECEIVED = "epictweak_book_received";

    @SubscribeEvent
    public static void onPlayerLogin(PlayerEvent.PlayerLoggedInEvent event) {
        if (!ModList.get().isLoaded("patchouli")) {
            return;
        }

        if (event.getEntity() instanceof ServerPlayer player) {
            CompoundTag persistentData = player.getPersistentData();

            // Если уже выдали – ничего не делаем
            if (persistentData.getBoolean(TAG_RECEIVED)) {
                return;
            }

            // Выдаём книгу
            ItemStack book = PatchouliAPI.get().getBookStack("epictweak:epic_guide");
            player.getInventory().add(book.copy());

            // Запоминаем, что игрок получил книгу
            persistentData.putBoolean(TAG_RECEIVED, true);
        }
    }
}