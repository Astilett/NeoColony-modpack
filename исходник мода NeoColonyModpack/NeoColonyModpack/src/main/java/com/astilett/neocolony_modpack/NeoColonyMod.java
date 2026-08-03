package com.astilett.neocolony;

import net.minecraft.nbt.CompoundTag;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.item.ItemStack;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.entity.player.PlayerEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.ModList;
import net.minecraftforge.fml.common.Mod;
import vazkii.patchouli.api.PatchouliAPI;

@Mod("neocolony_modpack")
public class NeoColonyMod {
    public NeoColonyMod() {
        MinecraftForge.EVENT_BUS.register(this);
    }

    private static final String TAG_RECEIVED = "neocolony_book_received";

    @SubscribeEvent
    public void onPlayerLogin(PlayerEvent.PlayerLoggedInEvent event) {
        if (!ModList.get().isLoaded("patchouli")) return;
        if (event.getEntity() instanceof ServerPlayer player) {
            CompoundTag data = player.getPersistentData();
            if (data.getBoolean(TAG_RECEIVED)) return;
            ItemStack book = PatchouliAPI.get().getBookStack("neocolony_modpack:NeoColony_guide");
            player.getInventory().add(book.copy());
            data.putBoolean(TAG_RECEIVED, true);
        }
    }
}